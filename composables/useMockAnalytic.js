import { computed, reactive, ref } from 'vue';

export function useMockAnalytics() {
  // ----- RNG (детерминированные моки)
  const seed = ref(42);
  function mulberry32(s) {
    return function () {
      let t = (s += 0x6d2b79f5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const rand = computed(() => mulberry32(seed.value));
  const rnd = () => rand.value();

  // ----- мок-данные заказов
  const names = ['Анна', 'Ксения', 'Мария', 'Екатерина', 'Дарья', 'Ольга', 'Виктория', 'Елена'];
  const surnames = ['Иванова', 'Смирнова', 'Кузнецова', 'Попова', 'Соколова', 'Лебедева', 'Козлова', 'Новикова'];
  const channels = ['site', 'mobile', 'instagram', 'telegram'];
  const statuses = ['new', 'paid', 'shipped', 'cancelled'];
  const avatar = (i) => `https://i.pravatar.cc/80?img=${(i % 70) + 1}`;

  function generateOrders(count = 24) {
    const out = [];
    for (let i = 0; i < count; i++) {
      const name = `${names[Math.floor(rnd() * names.length)]} ${surnames[Math.floor(rnd() * surnames.length)]}`;
      const email = `user${Math.floor(rnd() * 9000 + 1000)}@mail.ru`;
      const items = Math.floor(rnd() * 4) + 1;
      const total = Math.round((4000 + rnd() * 8000) * items);
      const status = statuses[Math.floor(rnd() * statuses.length)];
      const dayOffset = Math.floor(rnd() * 14);
      const dt = new Date(Date.now() - dayOffset * 86400000 - Math.floor(rnd() * 86400000));
      out.push({
        id: String(100000 + i),
        user: { name, email, avatar: avatar(i) },
        status,
        items,
        total,
        created_at: dt.toISOString(),
        channel: channels[Math.floor(rnd() * channels.length)],
      });
    }
    return out.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
  }

  const orders = ref(generateOrders());
  const ordersLatest = computed(() => orders.value.slice(0, 10));

  // ----- серии (выручка по неделям/месяцам)
  const granularity = ref('weekly'); // 'weekly' | 'monthly'
  const range = ref(null);

  function weekNo(d) {
    const onejan = new Date(d.getFullYear(), 0, 1);
    return Math.ceil(((+d - +onejan) / 86400000 + onejan.getDay() + 1) / 7);
  }

  function seriesWeekly(weeks = 12) {
    const arr = [];
    const now = new Date();
    for (let i = weeks - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i * 7);
      const value = Math.round(200000 + rnd() * 400000);
      arr.push({ label: `нед ${weekNo(d)}`, value });
    }
    return arr;
  }

  function seriesMonthly(months = 12) {
    const arr = [];
    const now = new Date();
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const value = Math.round(900000 + rnd() * 1600000);
      arr.push({ label: d.toLocaleString('ru-RU', { month: 'short' }), value });
    }
    return arr;
  }

  const revenueSeries = computed(() =>
      granularity.value === 'weekly' ? seriesWeekly(12) : seriesMonthly(12),
  );
  const granularityLabel = computed(() => (granularity.value === 'weekly' ? 'недели' : 'месяцы'));
  const sumSeries = (s) => s.reduce((a, b) => a + b.value, 0);

  // ----- метрики и спарклайны
  const metrics = reactive({
    revenue: 0,
    revenueDelta: 0,
    orders: 0,
    ordersDelta: 0,
    conversion: 0,
    conversionDelta: 0,
    aov: 0,
    aovDelta: 0,
    favorites: 0,
    carts: 0,
    visits: 0,
  });

  const spark = reactive({
    revenue: [],
    orders: [],
    conversion: [],
    aov: [],
    favorites: [],
    carts: [],
    visits: [],
  });

  function recalcMetrics() {
    const rev = sumSeries(revenueSeries.value);
    const revPrev = Math.max(1, rev * (0.85 + rnd() * 0.2));

    const ord = orders.value.length;
    const ordPrev = Math.max(1, Math.round(ord * (0.8 + rnd() * 0.3)));

    const visits = Math.round(5000 + rnd() * 4000);
    const visitsPrev = Math.max(1, Math.round(visits * (0.85 + rnd() * 0.2)));

    const aov = rev / Math.max(1, ord);
    const aovPrev = Math.max(1, aov * (0.85 + rnd() * 0.2));

    const conversion = (ord / visits) * 100;
    const conversionPrev = (ordPrev / visitsPrev) * 100;

    metrics.revenue = rev;
    metrics.orders = ord;
    metrics.visits = visits;
    metrics.aov = aov;
    metrics.conversion = conversion;
    metrics.favorites = Math.round(1200 + rnd() * 600);
    metrics.carts = Math.round(700 + rnd() * 500);

    metrics.revenueDelta = ((rev - revPrev) / revPrev) * 100;
    metrics.ordersDelta = ((ord - ordPrev) / ordPrev) * 100;
    metrics.conversionDelta =
        ((conversion - conversionPrev) / Math.max(0.0001, conversionPrev)) * 100;
    metrics.aovDelta = ((aov - aovPrev) / aovPrev) * 100;

    const s = (min, max) => Array.from({ length: 16 }, () => Math.round(min + rnd() * (max - min)));
    spark.revenue = s(60, 100);
    spark.orders = s(40, 100);
    spark.conversion = s(20, 50);
    spark.aov = s(50, 100);
    spark.favorites = s(30, 100);
    spark.carts = s(30, 100);
    spark.visits = s(80, 140);

    // визуальный период
    const start = new Date();
    const end = new Date();
    if (granularity.value === 'weekly') start.setDate(start.getDate() - 7 * 11);
    else start.setMonth(start.getMonth() - 11);
    range.value = [start, end];
  }
  recalcMetrics();

  function regenerate() {
    seed.value = Math.floor(Math.random() * 1e6);
    orders.value = generateOrders();
    recalcMetrics();
  }

  return {
    // состояние
    granularity,
    granularityLabel,
    range,
    revenueSeries,
    sumSeries,
    ordersLatest,
    metrics,
    spark,
    // действия
    regenerate,
    recalcMetrics,
  };
}

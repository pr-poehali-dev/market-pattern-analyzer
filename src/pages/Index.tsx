import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

const MOEX_API = 'https://functions.poehali.dev/b2495c20-15db-42d9-8df9-14a0de5bcb1f';

interface StockQuote {
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
  open: number;
}

interface HistoryCandle {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

const patterns = [
  {
    id: 1,
    name: 'Голова и плечи',
    ticker: 'SBER',
    type: 'bearish',
    confidence: 87,
    detected: '2 часа назад',
    description: 'Медвежий паттерн разворота тренда',
  },
  {
    id: 2,
    name: 'Двойное дно',
    ticker: 'GAZP',
    type: 'bullish',
    confidence: 92,
    detected: '30 мин назад',
    description: 'Бычий паттерн разворота тренда',
  },
  {
    id: 3,
    name: 'Восходящий флаг',
    ticker: 'LKOH',
    type: 'bullish',
    confidence: 78,
    detected: '1 час назад',
    description: 'Бычий паттерн продолжения',
  },
  {
    id: 4,
    name: 'Нисходящий клин',
    ticker: 'YNDX',
    type: 'bullish',
    confidence: 84,
    detected: '45 мин назад',
    description: 'Бычий паттерн разворота',
  },
];

const getSignal = (changePercent: number) => {
  if (changePercent > 2) return { signal: 'ПОКУПКА', strength: 'strong' };
  if (changePercent > 1) return { signal: 'ПОКУПКА', strength: 'medium' };
  if (changePercent < -2) return { signal: 'ПРОДАЖА', strength: 'strong' };
  if (changePercent < -1) return { signal: 'ПРОДАЖА', strength: 'medium' };
  return { signal: 'УДЕРЖАНИЕ', strength: 'weak' };
};

const portfolioBase = [
  { ticker: 'SBER', shares: 100, avgPrice: 280.5 },
  { ticker: 'GAZP', shares: 200, avgPrice: 165.0 },
  { ticker: 'LKOH', shares: 10, avgPrice: 6600 },
];

export default function Index() {
  const [selectedStock, setSelectedStock] = useState('SBER');
  const [quotes, setQuotes] = useState<StockQuote[]>([]);
  const [history, setHistory] = useState<HistoryCandle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuotes();
    const interval = setInterval(fetchQuotes, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchHistory(selectedStock);
  }, [selectedStock]);

  const fetchQuotes = async () => {
    try {
      const response = await fetch(`${MOEX_API}?action=quotes&tickers=SBER,GAZP,LKOH,YNDX,ROSN`);
      const data = await response.json();
      setQuotes(data.quotes || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching quotes:', error);
      setLoading(false);
    }
  };

  const fetchHistory = async (ticker: string) => {
    try {
      const response = await fetch(`${MOEX_API}?action=history&ticker=${ticker}&days=30`);
      const data = await response.json();
      setHistory(data.history || []);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const getQuoteByTicker = (ticker: string) => {
    return quotes.find(q => q.ticker === ticker);
  };

  const portfolio = portfolioBase.map(item => {
    const quote = getQuoteByTicker(item.ticker);
    const current = quote?.price || item.avgPrice;
    const pl = (current - item.avgPrice) * item.shares;
    return { ...item, current, pl };
  });

  const totalPL = portfolio.reduce((sum, item) => sum + item.pl, 0);
  const totalValue = portfolio.reduce((sum, item) => sum + item.shares * item.current, 0);

  const selectedQuote = getQuoteByTicker(selectedStock);
  const moexIndex = quotes.length > 0 ? quotes[0].price : 3245.67;
  const moexChange = quotes.length > 0 ? quotes[0].changePercent : 1.23;

  const chartData = history.slice(-20).map(candle => ({
    time: new Date(candle.date).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }),
    price: candle.close,
    volume: Math.floor(candle.volume / 1000),
  }));

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => window.history.back()}
              className="hover:bg-primary/10"
            >
              <Icon name="ArrowLeft" size={20} />
            </Button>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                MOEX Analytics
              </h1>
              <p className="text-muted-foreground mt-1">
                Анализ биржевых паттернов в реальном времени
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon">
              <Icon name="Bell" size={20} />
            </Button>
            <Button variant="outline" size="icon">
              <Icon name="Settings" size={20} />
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Индекс MOEX
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? '...' : moexIndex.toFixed(2)}</div>
              <div className="flex items-center gap-1 mt-1">
                {moexChange >= 0 ? (
                  <Icon name="TrendingUp" size={16} className="text-success" />
                ) : (
                  <Icon name="TrendingDown" size={16} className="text-destructive" />
                )}
                <span className={`text-sm font-medium ${moexChange >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {moexChange >= 0 ? '+' : ''}{moexChange.toFixed(2)}%
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Активные сигналы
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <div className="flex items-center gap-1 mt-1">
                <div className="h-2 w-2 rounded-full bg-success animate-pulse-slow" />
                <span className="text-sm text-muted-foreground">12 на покупку</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Паттернов найдено
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">18</div>
              <div className="flex items-center gap-1 mt-1">
                <Icon name="Activity" size={16} className="text-secondary" />
                <span className="text-sm text-muted-foreground">За последний час</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Портфель
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalValue.toLocaleString('ru-RU')} ₽
              </div>
              <div className="flex items-center gap-1 mt-1">
                {totalPL >= 0 ? (
                  <>
                    <Icon name="TrendingUp" size={16} className="text-success" />
                    <span className="text-success text-sm font-medium">
                      +{totalPL.toLocaleString('ru-RU')} ₽
                    </span>
                  </>
                ) : (
                  <>
                    <Icon name="TrendingDown" size={16} className="text-destructive" />
                    <span className="text-destructive text-sm font-medium">
                      {totalPL.toLocaleString('ru-RU')} ₽
                    </span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="charts" className="space-y-4">
          <TabsList className="bg-card/50 backdrop-blur">
            <TabsTrigger value="charts">
              <Icon name="LineChart" size={16} className="mr-2" />
              Графики
            </TabsTrigger>
            <TabsTrigger value="patterns">
              <Icon name="Sparkles" size={16} className="mr-2" />
              Паттерны
            </TabsTrigger>
            <TabsTrigger value="signals">
              <Icon name="TrendingUp" size={16} className="mr-2" />
              Сигналы
            </TabsTrigger>
            <TabsTrigger value="portfolio">
              <Icon name="Wallet" size={16} className="mr-2" />
              Портфель
            </TabsTrigger>
          </TabsList>

          <TabsContent value="charts" className="space-y-4">
            <Card className="bg-card/50 backdrop-blur border-border/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    График цены {selectedStock}
                    {selectedQuote && (
                      <Badge 
                        variant="outline" 
                        className={selectedQuote.changePercent >= 0 
                          ? 'bg-success/10 text-success border-success/30'
                          : 'bg-destructive/10 text-destructive border-destructive/30'
                        }
                      >
                        {selectedQuote.changePercent >= 0 ? '+' : ''}{selectedQuote.changePercent.toFixed(2)}%
                      </Badge>
                    )}
                  </CardTitle>
                  <div className="flex gap-2">
                    {['SBER', 'GAZP', 'LKOH', 'YNDX'].map((ticker) => (
                      <Button
                        key={ticker}
                        variant={selectedStock === ticker ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedStock(ticker)}
                      >
                        {ticker}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="h-[400px] flex items-center justify-center">
                    <div className="text-muted-foreground">Загрузка данных...</div>
                  </div>
                ) : chartData.length === 0 ? (
                  <div className="h-[400px] flex items-center justify-center">
                    <div className="text-muted-foreground">Нет данных для отображения</div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={400}>
                    <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--secondary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--secondary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="price"
                      stroke="hsl(var(--secondary))"
                      strokeWidth={2}
                      fill="url(#colorPrice)"
                    />
                    <ReferenceLine
                      y={2900}
                      stroke="hsl(var(--primary))"
                      strokeDasharray="5 5"
                      label={{ value: 'Сопротивление', fill: 'hsl(var(--primary))' }}
                    />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur border-border/50">
              <CardHeader>
                <CardTitle>Объём торгов</CardTitle>
              </CardHeader>
              <CardContent>
                {chartData.length === 0 ? (
                  <div className="h-[200px] flex items-center justify-center">
                    <div className="text-muted-foreground">Нет данных</div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="volume"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                    />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="patterns" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {patterns.map((pattern) => (
                <Card
                  key={pattern.id}
                  className="bg-card/50 backdrop-blur border-border/50 hover:border-primary/50 transition-colors"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{pattern.name}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {pattern.description}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          pattern.type === 'bullish'
                            ? 'bg-success/10 text-success border-success/30'
                            : 'bg-destructive/10 text-destructive border-destructive/30'
                        }
                      >
                        {pattern.type === 'bullish' ? 'Бычий' : 'Медвежий'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Тикер</span>
                        <span className="font-semibold">{pattern.ticker}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Уверенность</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full ${
                                pattern.confidence > 85
                                  ? 'bg-success'
                                  : pattern.confidence > 70
                                  ? 'bg-secondary'
                                  : 'bg-primary'
                              }`}
                              style={{ width: `${pattern.confidence}%` }}
                            />
                          </div>
                          <span className="font-semibold">{pattern.confidence}%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Обнаружено</span>
                        <span className="text-sm">{pattern.detected}</span>
                      </div>
                      <Button className="w-full mt-2" variant="outline">
                        <Icon name="Eye" size={16} className="mr-2" />
                        Посмотреть на графике
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="signals" className="space-y-4">
            <Card className="bg-card/50 backdrop-blur border-border/50">
              <CardHeader>
                <CardTitle>Торговые сигналы</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {quotes.map((quote) => {
                    const signalData = getSignal(quote.changePercent);
                    return (
                      <div
                        key={quote.ticker}
                        className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="text-lg font-bold">{quote.ticker}</div>
                          <Badge
                            variant="outline"
                            className={
                              signalData.signal === 'ПОКУПКА'
                                ? 'bg-success/10 text-success border-success/30'
                                : signalData.signal === 'ПРОДАЖА'
                                ? 'bg-destructive/10 text-destructive border-destructive/30'
                                : 'bg-muted text-muted-foreground'
                            }
                          >
                            {signalData.signal}
                          </Badge>
                          <div className="flex items-center gap-1">
                            {quote.changePercent >= 0 ? (
                              <Icon name="TrendingUp" size={16} className="text-success" />
                            ) : (
                              <Icon name="TrendingDown" size={16} className="text-destructive" />
                            )}
                            <span
                              className={`text-sm font-medium ${
                                quote.changePercent >= 0 ? 'text-success' : 'text-destructive'
                              }`}
                            >
                              {quote.changePercent > 0 ? '+' : ''}
                              {quote.changePercent.toFixed(2)}%
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold">
                            {quote.price.toLocaleString('ru-RU')} ₽
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Сила сигнала:{' '}
                            <span
                              className={
                                signalData.strength === 'strong'
                                  ? 'text-success'
                                  : signalData.strength === 'medium'
                                  ? 'text-secondary'
                                  : 'text-muted-foreground'
                              }
                            >
                              {signalData.strength === 'strong'
                                ? 'Высокая'
                                : signalData.strength === 'medium'
                                ? 'Средняя'
                                : 'Низкая'}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="portfolio" className="space-y-4">
            <Card className="bg-card/50 backdrop-blur border-border/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Мой портфель</CardTitle>
                  <div className="text-right">
                    <div className="text-2xl font-bold">
                      {totalValue.toLocaleString('ru-RU')} ₽
                    </div>
                    <div
                      className={`text-sm font-medium ${
                        totalPL >= 0 ? 'text-success' : 'text-destructive'
                      }`}
                    >
                      {totalPL >= 0 ? '+' : ''}
                      {totalPL.toLocaleString('ru-RU')} ₽ (
                      {((totalPL / (totalValue - totalPL)) * 100).toFixed(2)}%)
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {portfolio.map((item, idx) => {
                    const plPercent = ((item.pl / (item.avgPrice * item.shares)) * 100).toFixed(
                      2
                    );
                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                      >
                        <div>
                          <div className="font-bold text-lg">{item.ticker}</div>
                          <div className="text-sm text-muted-foreground">
                            {item.shares} шт × {item.avgPrice} ₽
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">
                            {(item.shares * item.current).toLocaleString('ru-RU')} ₽
                          </div>
                          <div
                            className={`text-sm font-medium ${
                              item.pl >= 0 ? 'text-success' : 'text-destructive'
                            }`}
                          >
                            {item.pl >= 0 ? '+' : ''}
                            {item.pl} ₽ ({plPercent}%)
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
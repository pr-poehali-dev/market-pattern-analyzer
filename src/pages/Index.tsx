import { useState } from 'react';
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

const mockStockData = [
  { time: '09:00', price: 2850, volume: 1200 },
  { time: '10:00', price: 2865, volume: 1450 },
  { time: '11:00', price: 2840, volume: 1600 },
  { time: '12:00', price: 2880, volume: 1800 },
  { time: '13:00', price: 2920, volume: 2100 },
  { time: '14:00', price: 2895, volume: 1900 },
  { time: '15:00', price: 2930, volume: 2300 },
  { time: '16:00', price: 2950, volume: 2500 },
  { time: '17:00', price: 2975, volume: 2200 },
];

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

const signals = [
  { ticker: 'SBER', signal: 'ПОКУПКА', price: 295.4, change: 2.3, strength: 'strong' },
  { ticker: 'GAZP', signal: 'ПОКУПКА', price: 167.2, change: 1.8, strength: 'medium' },
  { ticker: 'LKOH', signal: 'ПРОДАЖА', price: 6543, change: -1.2, strength: 'strong' },
  { ticker: 'YNDX', signal: 'УДЕРЖАНИЕ', price: 2950, change: 0.5, strength: 'weak' },
  { ticker: 'ROSN', signal: 'ПОКУПКА', price: 543.2, change: 3.1, strength: 'strong' },
];

const portfolio = [
  { ticker: 'SBER', shares: 100, avgPrice: 280.5, current: 295.4, pl: 1490 },
  { ticker: 'GAZP', shares: 200, avgPrice: 165.0, current: 167.2, pl: 440 },
  { ticker: 'LKOH', shares: 10, avgPrice: 6600, current: 6543, pl: -570 },
  { ticker: 'YNDX', shares: 5, avgPrice: 2900, current: 2950, pl: 250 },
];

export default function Index() {
  const [selectedStock, setSelectedStock] = useState('YNDX');

  const totalPL = portfolio.reduce((sum, item) => sum + item.pl, 0);
  const totalValue = portfolio.reduce((sum, item) => sum + item.shares * item.current, 0);

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              MOEX Analytics
            </h1>
            <p className="text-muted-foreground mt-1">
              Анализ биржевых паттернов в реальном времени
            </p>
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
              <div className="text-2xl font-bold">3,245.67</div>
              <div className="flex items-center gap-1 mt-1">
                <Icon name="TrendingUp" size={16} className="text-success" />
                <span className="text-success text-sm font-medium">+1.23%</span>
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
                    <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                      +0.85%
                    </Badge>
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
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={mockStockData}>
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
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur border-border/50">
              <CardHeader>
                <CardTitle>Объём торгов</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={mockStockData}>
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
                  {signals.map((signal, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-lg font-bold">{signal.ticker}</div>
                        <Badge
                          variant="outline"
                          className={
                            signal.signal === 'ПОКУПКА'
                              ? 'bg-success/10 text-success border-success/30'
                              : signal.signal === 'ПРОДАЖА'
                              ? 'bg-destructive/10 text-destructive border-destructive/30'
                              : 'bg-muted text-muted-foreground'
                          }
                        >
                          {signal.signal}
                        </Badge>
                        <div className="flex items-center gap-1">
                          {signal.change >= 0 ? (
                            <Icon name="TrendingUp" size={16} className="text-success" />
                          ) : (
                            <Icon name="TrendingDown" size={16} className="text-destructive" />
                          )}
                          <span
                            className={`text-sm font-medium ${
                              signal.change >= 0 ? 'text-success' : 'text-destructive'
                            }`}
                          >
                            {signal.change > 0 ? '+' : ''}
                            {signal.change}%
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold">
                          {signal.price.toLocaleString('ru-RU')} ₽
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Сила сигнала:{' '}
                          <span
                            className={
                              signal.strength === 'strong'
                                ? 'text-success'
                                : signal.strength === 'medium'
                                ? 'text-secondary'
                                : 'text-muted-foreground'
                            }
                          >
                            {signal.strength === 'strong'
                              ? 'Высокая'
                              : signal.strength === 'medium'
                              ? 'Средняя'
                              : 'Низкая'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
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

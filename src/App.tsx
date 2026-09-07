import { useCallback, useMemo, useState } from 'react';
import './App.css';
import { CalendarIcon, ChevronLeftIcon, PlusIcon } from './icons';

type Cycle = 'monthly' | 'yearly';

type Subscription = {
  id: string;
  name: string;
  cost: number;
  cycle: Cycle;
  nextBilling: string;
  account?: string;
  notes?: string;
  cancelled?: boolean;
};

type Screen =
  | { name: 'home' }
  | { name: 'add' }
  | { name: 'detail'; id: string };

const initialSubscriptions: Subscription[] = [
  {
    id: '1',
    name: 'Spotify',
    cost: 11.99,
    cycle: 'monthly',
    nextBilling: '2026-09-18',
    account: 'dante@mail.com',
  },
  {
    id: '2',
    name: 'Netflix',
    cost: 17.99,
    cycle: 'monthly',
    nextBilling: '2026-09-24',
    account: 'dante@mail.com',
  },
  {
    id: '3',
    name: 'iCloud+',
    cost: 2.99,
    cycle: 'monthly',
    nextBilling: '2026-10-02',
  },
  {
    id: '4',
    name: 'Notion',
    cost: 96,
    cycle: 'yearly',
    nextBilling: '2027-01-11',
    notes: 'Team plan, renews with the design seat.',
  },
];

const money = (value: number) =>
  value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

const formatDate = (iso: string) => {
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const delay = (index: number) => ({ animationDelay: `${index * 70}ms` });

export default function App() {
  const [subscriptions, setSubscriptions] = useState(initialSubscriptions);
  const [screen, setScreen] = useState<Screen>({ name: 'home' });
  const [leaving, setLeaving] = useState(false);

  const go = useCallback((next: Screen) => {
    setLeaving(true);
    window.setTimeout(() => {
      setScreen(next);
      setLeaving(false);
    }, 260);
  }, []);

  const monthlyTotal = useMemo(
    () =>
      subscriptions
        .filter((sub) => !sub.cancelled)
        .reduce(
          (sum, sub) => sum + (sub.cycle === 'yearly' ? sub.cost / 12 : sub.cost),
          0,
        ),
    [subscriptions],
  );

  const addSubscription = (sub: Subscription) => {
    setSubscriptions((prev) => [...prev, sub]);
    go({ name: 'home' });
  };

  const cancelSubscription = (id: string) => {
    setSubscriptions((prev) =>
      prev.map((sub) => (sub.id === id ? { ...sub, cancelled: true } : sub)),
    );
    go({ name: 'home' });
  };

  const active = screen.name === 'detail'
    ? subscriptions.find((sub) => sub.id === screen.id)
    : undefined;

  return (
    <div className="app">
      <div className="shell">
        <div
          key={`${screen.name}-${screen.name === 'detail' ? screen.id : ''}`}
          className={`screen${leaving ? ' leaving' : ''}`}
        >
          {screen.name === 'home' && (
            <Home
              subscriptions={subscriptions}
              monthlyTotal={monthlyTotal}
              onManage={(id) => go({ name: 'detail', id })}
            />
          )}

          {screen.name === 'add' && (
            <AddSubscription
              onCancel={() => go({ name: 'home' })}
              onSave={addSubscription}
            />
          )}

          {screen.name === 'detail' && active && (
            <Detail
              subscription={active}
              onBack={() => go({ name: 'home' })}
              onCancelSubscription={() => cancelSubscription(active.id)}
            />
          )}
        </div>

        {screen.name === 'home' && !leaving && (
          <button className="btn fab" onClick={() => go({ name: 'add' })}>
            <PlusIcon />
            add subscription
          </button>
        )}
      </div>
    </div>
  );
}

function Home({
  subscriptions,
  monthlyTotal,
  onManage,
}: {
  subscriptions: Subscription[];
  monthlyTotal: number;
  onManage: (id: string) => void;
}) {
  return (
    <>
      <header className="header">
        <h1>subscriptions</h1>
        <p className="subtle">{money(monthlyTotal)} per month across {subscriptions.filter((s) => !s.cancelled).length} active services</p>
      </header>

      {subscriptions.length === 0 ? (
        <div className="empty">nothing tracked yet</div>
      ) : (
        <div className="list">
          {subscriptions.map((sub, index) => (
            <article className="card" key={sub.id} style={delay(index)}>
              <div className="card-main">
                <p className={`card-name${sub.cancelled ? ' strike' : ''}`}>{sub.name}</p>
                <p className="card-meta">
                  <CalendarIcon />{' '}
                  {sub.cancelled
                    ? 'cancelled'
                    : `next ${formatDate(sub.nextBilling)}`}
                </p>
              </div>
              <div className="card-right">
                <div>
                  <div className="card-cost">{money(sub.cost)}</div>
                  <div className="card-meta">/{sub.cycle === 'yearly' ? 'yr' : 'mo'}</div>
                </div>
                <button className="btn small" onClick={() => onManage(sub.id)}>
                  manage
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}

function AddSubscription({
  onCancel,
  onSave,
}: {
  onCancel: () => void;
  onSave: (sub: Subscription) => void;
}) {
  const [name, setName] = useState('');
  const [cost, setCost] = useState('');
  const [cycle, setCycle] = useState<Cycle>('monthly');
  const [nextBilling, setNextBilling] = useState('');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const parsedCost = Number(cost);
  const valid =
    name.trim() !== '' &&
    cost.trim() !== '' &&
    Number.isFinite(parsedCost) &&
    parsedCost >= 0 &&
    nextBilling !== '';

  const submit = () => {
    if (!valid || submitted) return;
    setSubmitted(true);
    onSave({
      id: crypto.randomUUID(),
      name: name.trim(),
      cost: parsedCost,
      cycle,
      nextBilling,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <>
      <div className="topbar">
        <button className="btn text" onClick={onCancel}>
          <ChevronLeftIcon />
          cancel
        </button>
      </div>

      <h2>add subscription</h2>

      <div className="form">
        <div className="field" style={delay(0)}>
          <span className="label">name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Figma"
          />
        </div>

        <div className="row">
          <div className="field" style={delay(1)}>
            <span className="label">cost</span>
            <input
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              inputMode="decimal"
              placeholder="0.00"
            />
          </div>
          <div className="field" style={delay(2)}>
            <span className="label">billing cycle</span>
            <select value={cycle} onChange={(e) => setCycle(e.target.value as Cycle)}>
              <option value="monthly">monthly</option>
              <option value="yearly">yearly</option>
            </select>
          </div>
        </div>

        <div className="field" style={delay(3)}>
          <span className="label">next billing date</span>
          <input
            type="date"
            value={nextBilling}
            onChange={(e) => setNextBilling(e.target.value)}
          />
        </div>

        <div className="field" style={delay(4)}>
          <span className="label">notes</span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="optional"
          />
        </div>

        <button className="btn block" style={delay(5)} onClick={submit} disabled={!valid || submitted}>
          save
        </button>
      </div>
    </>
  );
}

function Detail({
  subscription,
  onBack,
  onCancelSubscription,
}: {
  subscription: Subscription;
  onBack: () => void;
  onCancelSubscription: () => void;
}) {
  const rows: Array<[string, string]> = [
    ['billing cycle', subscription.cycle],
    [
      'next charge',
      subscription.cancelled ? 'none' : formatDate(subscription.nextBilling),
    ],
    ['linked account', subscription.account ?? '—'],
    ['notes', subscription.notes ?? '—'],
  ];

  return (
    <>
      <div className="topbar">
        <button className="btn text" onClick={onBack}>
          <ChevronLeftIcon />
          back
        </button>
        {subscription.cancelled && <span className="badge">cancelled</span>}
      </div>

      <h2>{subscription.name}</h2>
      <p className="detail-cost">
        {money(subscription.cost)}
        <span className="subtle"> /{subscription.cycle === 'yearly' ? 'yr' : 'mo'}</span>
      </p>

      <div className="detail-list">
        {rows.map(([key, value], index) => (
          <div className="detail-row" key={key} style={delay(index)}>
            <span>{key}</span>
            <span>{value}</span>
          </div>
        ))}
      </div>

      <div className="actions">
        <button
          className="btn block"
          onClick={onCancelSubscription}
          disabled={subscription.cancelled}
        >
          cancel subscription
        </button>
        <button className="btn ghost block">edit</button>
      </div>
    </>
  );
}

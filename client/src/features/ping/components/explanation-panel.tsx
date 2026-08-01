const FACTS = [
  {
    term: 'ICMP Echo',
    detail:
      'Ping sends an ICMP Echo Request to the target and waits for an Echo Reply. It measures how long the round trip takes.',
  },
  {
    term: 'TTL',
    detail:
      'Time To Live is a counter that drops by one at every router hop. It stops packets looping forever if a route is broken.',
  },
  {
    term: 'RTT',
    detail:
      'Round-Trip Time is how long a packet takes to reach the host and come back — the core measure of network latency.',
  },
  {
    term: 'Packet loss',
    detail:
      'A reply that never comes back within the timeout counts as lost. Even small loss percentages can disrupt real-time traffic like calls.',
  },
];

export const ExplanationPanel = () => (
  <dl className="space-y-3">
    {FACTS.map((fact) => (
      <div key={fact.term}>
        <dt className="font-mono text-xs font-medium text-signal">{fact.term}</dt>
        <dd className="mt-0.5 text-sm leading-relaxed text-ink-muted">{fact.detail}</dd>
      </div>
    ))}
  </dl>
);

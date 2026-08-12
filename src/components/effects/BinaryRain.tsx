const streams = [
  "1\n0\n1\n1\n0\n0\n1\n0\n1\n0\n1\n1",
  "0\n1\n0\n0\n1\n1\n0\n1\n1\n0\n0\n1",
  "1\n1\n0\n1\n0\n1\n0\n0\n1\n1\n0\n0",
  "0\n0\n1\n0\n1\n0\n1\n1\n0\n0\n1\n1",
];

export function BinaryRain() {
  return (
    <div className="binary-rain" aria-hidden="true">
      {(["left", "right"] as const).map((side) => (
        <div className={`binary-rain-edge ${side}`} key={side}>
          {streams.map((stream, index) => (
            <span key={`${side}-${index}`}>{stream}</span>
          ))}
        </div>
      ))}
    </div>
  );
}

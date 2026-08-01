import { describe, expect, it } from "vitest";
import { PingParser } from "../src/infrastructure/parsers/ping-parser.js";

/* Each test feeds one realistic line of `ping` output into the parser
and checks the typed event that comes out. No mocking is needed
because PingParser is a pure, stateful class with no I/O.*/
describe("PingParser", () => {
  it('parses the "PING ... (ip)" startup line into a ping:started event', () => {
    const parser = new PingParser();
    const event = parser.parseLine(
      "PING google.com (142.250.1.1) 56(84) bytes of data.",
    );

    expect(event).toEqual({
      type: "ping:started",
      host: "PING google.com (142.250.1.1) 56(84) bytes of data.",
      resolvedIp: "142.250.1.1",
    });
  });

  it("parses a successful reply line into a ping:reply event", () => {
    const parser = new PingParser();
    const event = parser.parseLine(
      "64 bytes from lga25s79-in-f14.1e100.net (142.250.1.1): icmp_seq=1 ttl=115 time=12.3 ms",
    );

    expect(event).toEqual({
      type: "ping:reply",
      reply: { bytes: 64, sequence: 1, ttl: 115, rttMs: 12.3 },
    });
  });

  it("parses a timeout line into a ping:timeout event", () => {
    const parser = new PingParser();
    const event = parser.parseLine("Request timeout for icmp_seq 3");

    expect(event).toEqual({ type: "ping:timeout", timeout: { sequence: 3 } });
  });

  it("emits a ping:completed event once both the summary and rtt lines arrive", () => {
    const parser = new PingParser();

    // The summary line alone doesn't produce an event yet — the parser
    // is waiting for the rtt line to arrive on the next line.
    const summaryEvent = parser.parseLine(
      "4 packets transmitted, 4 received, 0% packet loss, time 3005ms",
    );
    expect(summaryEvent).toBeNull();

    const completedEvent = parser.parseLine(
      "rtt min/avg/max/mdev = 11.878/12.345/13.001/0.456 ms",
    );

    expect(completedEvent).toEqual({
      type: "ping:completed",
      statistics: {
        transmitted: 4,
        received: 4,
        packetLossPercent: 0,
        durationMs: 3005,
        minRttMs: 11.878,
        avgRttMs: 12.345,
        maxRttMs: 13.001,
        stddevRttMs: 0.456,
      },
    });
  });

  it("returns null for blank or unrecognized lines", () => {
    const parser = new PingParser();
    expect(parser.parseLine("")).toBeNull();
    expect(parser.parseLine("   ")).toBeNull();
    expect(parser.parseLine("some unrelated text")).toBeNull();
  });
});

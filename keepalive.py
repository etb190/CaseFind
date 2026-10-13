#!/usr/bin/env python3
"""
CaseFind keepalive
==================
Standalone terminal script for Lightning AI (or any runtime that pauses or
disconnects on inactivity). It prints a heartbeat with live ingestion status
so the session stays active, and only exits when you type `stop` (+ Enter).
Ctrl+C also quits.

Usage:
    python3 keepalive.py

Optional environment overrides:
    DB_PATH=~/cases.db        database to watch (same default as ingest_cases.py)
    INGEST_LOG=~/ingest.log   ingest log file to tail for live progress
    KA_INTERVAL=45            heartbeat interval in seconds
"""
import os
import sys
import time
import sqlite3
import threading
import subprocess

DB_PATH = os.environ.get("DB_PATH", os.path.expanduser("~/cases.db"))
LOG_PATH = os.environ.get("INGEST_LOG", os.path.expanduser("~/ingest.log"))
INTERVAL = max(10, int(os.environ.get("KA_INTERVAL", "45")))

T0 = time.time()
stop = threading.Event()


def ingest_pids():
    try:
        out = subprocess.run(["pgrep", "-f", "ingest_cases.py"],
                             capture_output=True, text=True, timeout=5)
        return [p for p in out.stdout.split() if p.strip()]
    except Exception:
        return []


def db_gb():
    try:
        return os.path.getsize(DB_PATH) / 1e9
    except OSError:
        return 0.0


def db_rows():
    if not os.path.exists(DB_PATH):
        return "no db yet"
    try:
        con = sqlite3.connect(f"file:{DB_PATH}?mode=ro", uri=True, timeout=2)
        n = con.execute("SELECT count(*) FROM cases").fetchone()[0]
        con.close()
        return f"{n:,} rows"
    except Exception:
        return "rows: (db busy)"


def last_log_line():
    try:
        with open(LOG_PATH, "rb") as f:
            f.seek(0, 2)
            size = f.tell()
            f.seek(max(0, size - 2048))
            lines = f.read().decode("utf-8", "replace").strip().splitlines()
            return lines[-1][:110] if lines else "(log empty)"
    except OSError:
        return "(no log file)"


def fmt_up():
    s = int(time.time() - T0)
    return f"{s // 3600}h{(s % 3600) // 60:02d}m{s % 60:02d}s"


def print_status(detailed=False):
    pids = ingest_pids()
    state = "RUNNING pid " + ",".join(pids) if pids else "NOT RUNNING"
    line = (f"[{time.strftime('%H:%M:%S')}] up {fmt_up()} | "
            f"ingest: {state} | db: {db_gb():.2f} GB")
    if detailed:
        line += f" | {db_rows()}"
        ll = last_log_line()
        if ll and ll != "(no log file)":
            line += f"\n    log> {ll}"
    print(line, flush=True)


def input_loop():
    for line in sys.stdin:
        cmd = line.strip().lower()
        if cmd == "stop":
            print("[keepalive] stop requested - exiting.", flush=True)
            stop.set()
            return
        if cmd in ("status", "s", "?"):
            print_status(detailed=True)
        elif cmd:
            print("[keepalive] commands: status | stop", flush=True)
    # stdin closed (e.g. launched with nohup): keep heartbeating until killed
    print("[keepalive] stdin closed - heartbeats continue; "
          "quit with Ctrl+C or: pkill -f keepalive.py", flush=True)


def main():
    print("=" * 68)
    print("CaseFind keepalive - keeps this runtime session active.")
    print("Commands: status  |  stop   (Ctrl+C also quits)")
    print(f"Watching: {DB_PATH}")
    print(f"Ingest log: {LOG_PATH}  (heartbeat every {INTERVAL}s)")
    print("=" * 68, flush=True)
    threading.Thread(target=input_loop, daemon=True).start()

    prev_gb = db_gb()
    window = 0.0
    last = time.time()
    while not stop.is_set():
        time.sleep(1)
        now = time.time()
        window += now - last
        last = now
        if window >= INTERVAL:
            gb = db_gb()
            rate = (gb - prev_gb) / (window / 60) if window else 0.0
            print_status(detailed=True)
            if rate > 0.001:
                print(f"    db growth: {rate:.2f} GB/min", flush=True)
            prev_gb = gb
            window = 0.0
    print("[keepalive] stopped. NOTE: the ingest keeps running on its own "
          "(nohup/tmux). To stop the ingest too: pkill -f ingest_cases.py",
          flush=True)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n[keepalive] stopped (Ctrl+C). The ingest keeps running on its own.",
              flush=True)

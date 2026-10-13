#!/usr/bin/env python3
"""Parallel HTTP range fetcher: streams a remote file to stdout IN ORDER using N connections.
Usage: python3 pfetch.py <url> [chunk_mb] [num_connections]
Defeats per-connection bandwidth throttling by downloading consecutive chunks in parallel
and writing them sequentially to stdout (safe to pipe into a decompressor)."""
import sys
import os
import threading
import queue
import urllib.request


def get_size(url):
    req = urllib.request.Request(url, method="HEAD")
    with urllib.request.urlopen(req, timeout=60) as r:
        return int(r.headers["Content-Length"])


def worker(url, jobs, results, retries=5):
    while True:
        job = jobs.get()
        if job is None:
            return
        idx, start, end = job
        data = None
        for attempt in range(retries):
            try:
                req = urllib.request.Request(url, headers={"Range": f"bytes={start}-{end}"})
                with urllib.request.urlopen(req, timeout=180) as r:
                    data = r.read()
                if len(data) != (end - start + 1):
                    raise IOError(f"short read: got {len(data)} want {end-start+1}")
                break
            except Exception as e:
                sys.stderr.write(f"[pfetch] range {idx} attempt {attempt+1} failed: {e}\n")
                sys.stderr.flush()
                data = None
                import time as _t
                _t.sleep(min(2 ** attempt, 8))
        if data is None:
            sys.stderr.write(f"[pfetch] FATAL: range {idx} failed after {retries} attempts\n")
            sys.stderr.flush()
            os._exit(3)
        results.put((idx, data))


def main():
    url = sys.argv[1]
    chunk_mb = int(sys.argv[2]) if len(sys.argv) > 2 else 8
    nconn = int(sys.argv[3]) if len(sys.argv) > 3 else 6

    size = get_size(url)
    chunk = chunk_mb * 1024 * 1024
    total_chunks = (size + chunk - 1) // chunk
    sys.stderr.write(f"[pfetch] {url}\n[pfetch] size={size:,} chunk={chunk_mb}MB conns={nconn} chunks={total_chunks}\n")
    sys.stderr.flush()

    jobs = queue.Queue()
    results = queue.Queue()
    # Backpressure: at most nconn+4 chunks in flight ahead of the writer
    sem = threading.BoundedSemaphore(nconn + 4)

    for _ in range(nconn):
        threading.Thread(target=worker, args=(url, jobs, results), daemon=True).start()

    def producer():
        idx = 0
        while idx < total_chunks:
            start = idx * chunk
            end = min(size, start + chunk) - 1
            sem.acquire()
            jobs.put((idx, start, end))
            idx += 1
        for _ in range(nconn):
            jobs.put(None)

    threading.Thread(target=producer, daemon=True).start()

    out = sys.stdout.buffer
    written = 0
    buf = {}
    while written < total_chunks:
        idx, data = results.get()
        buf[idx] = data
        while written in buf:
            out.write(buf.pop(written))
            written += 1
            sem.release()
        try:
            out.flush()
        except Exception:
            pass
    try:
        out.flush()
    except Exception:
        pass
    sys.stderr.write(f"[pfetch] done: {written}/{total_chunks} chunks\n")


if __name__ == "__main__":
    main()

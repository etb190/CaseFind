import subprocess, csv, sys, json, re, html, time, pickle, os, io, bz2, shutil

csv.field_size_limit(sys.maxsize)
subprocess.run("pkill curl; pkill lbzip2", shell=True)

# the last run saved an empty cache - delete it
if os.path.exists("clus.pkl"):
    try:
        with open("clus.pkl", "rb") as f:
            if not pickle.load(f):
                os.remove("clus.pkl")
    except Exception:
        os.remove("clus.pkl")

subprocess.run(
    "apt-get -qq install -y lbzip2 2>/dev/null || sudo apt-get -qq install -y lbzip2",
    shell=True, capture_output=True)
USE_LB = bool(shutil.which("lbzip2"))
print("decompressor:", "lbzip2" if USE_LB else "python bz2 (slower but works)", flush=True)

B = "https://com-courtlistener-storage.s3-us-west-2.amazonaws.com/bulk-data/"
DATE = "2026-09-30"
TARGET, MIN_CHARS = 500, 2000
OPINION_TIME_CAP = 600
COURTS = {"scotus","ca1","ca2","ca3","ca4","ca5","ca6","ca7",
          "ca8","ca9","ca10","ca11","cadc","cafc"}

class BZ2Reader(io.RawIOBase):   # fallback if lbzip2 can't be installed
    def __init__(self, src):
        self.src, self.dec, self.buf = src, bz2.BZ2Decompressor(), b""
    def readable(self): return True
    def readinto(self, b):
        while len(self.buf) < len(b):
            chunk = self.src.read(1 << 20)
            if not chunk: break
            self.buf += self.dec.decompress(chunk)
        n = min(len(b), len(self.buf))
        b[:n], self.buf = self.buf[:n], self.buf[n:]
        return n

def stream(name):
    url = f"{B}{name}-{DATE}.csv.bz2"
    if USE_LB:
        p = subprocess.Popen(f"curl -sL {url} | lbzip2 -dc", shell=True,
                             stdout=subprocess.PIPE, bufsize=1 << 20)
        raw = p.stdout
    else:
        p = subprocess.Popen(["curl", "-sL", url], stdout=subprocess.PIPE, bufsize=1 << 20)
        raw = BZ2Reader(p.stdout)
    rd = csv.DictReader(io.TextIOWrapper(io.BufferedReader(raw, 1 << 20),
                        encoding="utf-8", errors="replace"),
                        escapechar="\\", doublequote=False)
    print(name, "columns:", (rd.fieldnames or [])[:12], "...", flush=True)
    return rd, p

def stop(p):
    p.kill()
    subprocess.run("pkill curl; pkill lbzip2", shell=True)

def text_of(r):
    t = r.get("plain_text") or ""
    if not t.strip():
        raw = (r.get("html_with_citations") or r.get("html_lawbox")
               or r.get("html") or r.get("xml_harvard") or "")
        t = html.unescape(re.sub(r"<[^>]+>", " ", raw))
    return re.sub(r"\s+", " ", t).strip()

if os.path.exists("clus.pkl"):
    with open("clus.pkl", "rb") as f:
        clus = pickle.load(f)
    print(f"loaded clus.pkl: {len(clus):,} clusters - slow stages skipped")
else:
    t0 = time.time()
    rd, p = stream("dockets")
    dock = {}
    for i, r in enumerate(rd):
        if r.get("court_id") in COURTS:
            dock[r["id"]] = r["court_id"]
        if i % 2_000_000 == 0:
            print(f"  dockets {i:,}, federal {len(dock):,}, {time.time()-t0:.0f}s", flush=True)
    stop(p)
    print(f"dockets done: {len(dock):,} federal, {time.time()-t0:.0f}s")

    rd, p = stream("opinion-clusters")
    clus = {}
    for i, r in enumerate(rd):
        d = r.get("docket_id")
        if d in dock:
            clus[r["id"]] = (dock[d], r.get("case_name",""), r.get("date_filed",""))
        if i % 1_000_000 == 0:
            print(f"  clusters {i:,}, federal {len(clus):,}, {time.time()-t0:.0f}s", flush=True)
    stop(p)
    print(f"clusters done: {len(clus):,} federal, {time.time()-t0:.0f}s")
    with open("clus.pkl", "wb") as f:
        pickle.dump(clus, f)

rd, p = stream("opinions")
kept, bad, t1 = 0, 0, time.time()
with open("opinions.jsonl", "w") as f:
    for i, r in enumerate(rd):
        if i < 5000 and not (r.get("cluster_id") or "").isdigit():
            bad += 1
        if i == 5000 and bad > 50:
            print("PARSING BROKEN: bad rows =", bad)
            break
        if kept >= TARGET or time.time() - t1 > OPINION_TIME_CAP:
            break
        c = clus.get(r.get("cluster_id"))
        if c:
            text = text_of(r)
            if len(text) >= MIN_CHARS:
                f.write(json.dumps({"id": r["id"], "court": c[0], "name": c[1], "date": c[2],
                    "url": f"https://www.courtlistener.com/?q=cluster_id:{r['cluster_id']}",
                    "text": text}) + "\n")
                kept += 1
                if kept % 50 == 0:
                    print(f"  kept {kept}, scanned {i:,}, {time.time()-t1:.0f}s", flush=True)
stop(p)
print(f"Done: {kept:,} federal opinions in {(time.time()-t1)/60:.1f} min")
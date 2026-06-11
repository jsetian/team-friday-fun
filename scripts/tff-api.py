#!/usr/bin/env python3
from __future__ import annotations

import base64
import csv
import io
import json
import os
import sqlite3
import threading
import urllib.error
import urllib.request
from dataclasses import dataclass
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
DB_PATH = Path(os.environ.get('TFF_DB_PATH', ROOT / 'data' / 'tff-work-style-lab.sqlite3'))
ADMIN_USERNAME = os.environ.get('TFF_ADMIN_USERNAME', '').strip()
ADMIN_PASSWORD = os.environ.get('TFF_ADMIN_PASSWORD', '').strip()
OPENAI_API_KEY = os.environ.get('TFF_OPENAI_API_KEY') or os.environ.get('OPENAI_API_KEY') or ''
IMAGE_MODEL = os.environ.get('TFF_IMAGE_MODEL', 'gpt-image-2')
IMAGE_QUALITY = os.environ.get('TFF_IMAGE_QUALITY', 'low')
HOST = os.environ.get('TFF_API_HOST', '127.0.0.1')
PORT = int(os.environ.get('TFF_API_PORT', '8787'))
EVENT_NAME = 'TFF Work Style Lab'
LOCK = threading.Lock()


def ensure_db() -> sqlite3.Connection:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute(
        '''
        CREATE TABLE IF NOT EXISTS submissions (
            id TEXT PRIMARY KEY,
            created_at TEXT NOT NULL,
            name TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT '',
            show_name_in_presentation INTEGER NOT NULL DEFAULT 0,
            predicted_style TEXT NOT NULL,
            primary_style TEXT NOT NULL,
            secondary_style TEXT NOT NULL,
            payload_json TEXT NOT NULL
        )
        '''
    )
    conn.commit()
    return conn


def parse_json(body: bytes):
    if not body:
        return None
    return json.loads(body.decode('utf-8'))


def is_admin(headers) -> bool:
    username = headers.get('x-tff-admin-username', '').strip()
    password = headers.get('x-tff-admin-password', '').strip()
    return username == ADMIN_USERNAME and password == ADMIN_PASSWORD


def submission_payload(row: sqlite3.Row) -> dict:
    payload = json.loads(row['payload_json'])
    payload['createdAt'] = row['created_at']
    payload['name'] = row['name']
    payload['role'] = row['role']
    payload['showNameInPresentation'] = bool(row['show_name_in_presentation'])
    payload['predictedStyle'] = row['predicted_style']
    payload['primaryStyle'] = row['primary_style']
    payload['secondaryStyle'] = row['secondary_style'] or None
    payload['portraitPrompt'] = build_portrait_prompt(payload)
    return payload


def build_portrait_prompt(payload: dict) -> str:
    playful = payload.get('playfulAnswers', {}) or {}
    trait_scores = payload.get('traitScores', {}) or {}
    primary = payload.get('primaryStyle', '')
    secondary = payload.get('secondaryStyle') or 'none'
    predicted = payload.get('predictedStyle', 'Not sure')
    return f'''Create a playful, warm, polished editorial character sketch that imagines what this person's work-style alter ego might look like for a team presentation guessing game.

IMPORTANT RULES:
- No text, no letters, no numbers, no labels, no logos, no captions, no signs, no badges.
- Do not include the person's name.
- Do not make it look like a real employee photo or formal portrait; make it a symbolic character generated from scratch.
- Make it friendly and workplace-appropriate, clever rather than mocking.
- Use a clean modern presentation style with subtle humor and strong visual clues.

Work-style profile:
- Primary style: {primary}
- Secondary style: {secondary}
- Person predicted they might be: {predicted}

Trait scores, 0 to 100:
- Openness: {trait_scores.get('openness', '')}
- Conscientiousness: {trait_scores.get('conscientiousness', '')}
- Extraversion: {trait_scores.get('extraversion', '')}
- Agreeableness: {trait_scores.get('agreeableness', '')}
- Steadiness: {trait_scores.get('steadiness', trait_scores.get('emotionalSteadiness', ''))}

Playful clues from their answers:
- Vehicle metaphor: {playful.get('vehicle', '')}
- Workday soundtrack: {playful.get('soundtrack', '')}
- Moment where they feel useful: {playful.get('usefulMoment', '')}
- Work-style superpower: {playful.get('superpower', '')}
- Character presentation direction: {playful.get('characterPresentation', 'Surprise me')}
- What they want AI to help with: {playful.get('aiHelp', '')}

Image concept:
A single expressive character in a lightly surreal office/creative-work environment, with clothing, props, posture, energy, and composition hinting at the profile and playful clues. It should feel like a clever sketch of what this person's work personality might look like, not a literal portrait. The team should be able to guess both who it is and what style they scored as from the visual clues alone. No words anywhere in the image.'''


def portrait_count(rows: list[sqlite3.Row]) -> int:
    count = 0
    for row in rows:
        payload = json.loads(row['payload_json'])
        if (payload.get('portrait') or {}).get('dataUrl'):
            count += 1
    return count


def export_json(rows: list[sqlite3.Row]) -> dict:
    return {
        'event': EVENT_NAME,
        'generatedAt': now_iso(),
        'imageCount': portrait_count(rows),
        'submissions': [
            {
                'name': row['name'],
                'role': row['role'],
                'showNameInPresentation': bool(row['show_name_in_presentation']),
                'predictedStyle': row['predicted_style'],
                'primaryStyle': row['primary_style'],
                'secondaryStyle': row['secondary_style'] or None,
                'traitScores': payload['traitScores'],
                'playfulAnswers': payload['playfulAnswers'],
                'rawAnswers': payload['rawAnswers'],
                'portraitPrompt': build_portrait_prompt(payload),
                'portrait': payload.get('portrait'),
                'createdAt': row['created_at'],
            }
            for row in rows
            for payload in [json.loads(row['payload_json'])]
        ],
    }


def export_csv(rows: list[sqlite3.Row]) -> str:
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        'createdAt', 'name', 'role', 'showNameInPresentation', 'predictedStyle', 'primaryStyle', 'secondaryStyle',
        'openness', 'conscientiousness', 'extraversion', 'agreeableness', 'steadiness',
        'vehicle', 'soundtrack', 'usefulMoment', 'superpower', 'aiHelp',
    ])
    for row in rows:
        payload = json.loads(row['payload_json'])
        traits = payload.get('traitScores', {})
        playful = payload.get('playfulAnswers', {})
        writer.writerow([
            row['created_at'],
            row['name'],
            row['role'],
            'true' if row['show_name_in_presentation'] else 'false',
            row['predicted_style'],
            row['primary_style'],
            row['secondary_style'],
            traits.get('openness', ''),
            traits.get('conscientiousness', ''),
            traits.get('extraversion', ''),
            traits.get('agreeableness', ''),
            traits.get('steadiness', traits.get('emotionalSteadiness', '')),
            playful.get('vehicle', ''),
            playful.get('soundtrack', ''),
            playful.get('usefulMoment', ''),
            playful.get('superpower', ''),
            playful.get('aiHelp', ''),
        ])
    return output.getvalue()


def now_iso() -> str:
    from datetime import datetime, timezone

    return datetime.now(timezone.utc).isoformat()


def validate_submission(payload: dict) -> dict:
    if not isinstance(payload, dict):
        raise ValueError('Invalid submission payload')
    required = ['id', 'createdAt', 'name', 'predictedStyle', 'primaryStyle', 'secondaryStyle', 'traitScores', 'playfulAnswers', 'rawAnswers']
    for key in required:
        if key not in payload:
            raise ValueError(f'Missing field: {key}')
    name = str(payload.get('name', '')).strip()
    if not name:
        raise ValueError('Name is required')
    return payload


class Handler(BaseHTTPRequestHandler):
    server_version = 'TFFAPI/1.0'

    def log_message(self, format, *args):
        return

    def do_OPTIONS(self):
        self.send_response(HTTPStatus.NO_CONTENT)
        self.send_common_headers()
        self.end_headers()

    def do_GET(self):
        path = urlparse(self.path).path
        if path == '/api/tff/health':
            return self.send_json({'ok': True, 'count': count_submissions()})
        if path.startswith('/api/tff/submissions/'):
            submission_id = path.removeprefix('/api/tff/submissions/').strip('/')
            if submission_id.endswith('/portrait'):
                submission_id = submission_id[:-len('/portrait')].strip('/')
            if not submission_id:
                return self.send_error_json(HTTPStatus.BAD_REQUEST, 'Submission id required')
            row = fetch_row_by_id(submission_id)
            if row is None:
                return self.send_error_json(HTTPStatus.NOT_FOUND, 'Submission not found')
            return self.send_json({'ok': True, 'submission': submission_payload(row)})
        if path == '/api/tff/submissions':
            if not is_admin(self.headers):
                return self.send_error_json(HTTPStatus.UNAUTHORIZED, 'Admin password required')
            return self.send_json({'event': EVENT_NAME, 'submissions': fetch_submissions()})
        if path == '/api/tff/submissions':
            if not is_admin(self.headers):
                return self.send_error_json(HTTPStatus.UNAUTHORIZED, 'Admin password required')
            return self.send_json({'event': EVENT_NAME, 'submissions': fetch_submissions()})
        if path.startswith('/api/tff/submissions/') and path.endswith('/portrait'):
            submission_id = path.removeprefix('/api/tff/submissions/').removesuffix('/portrait').strip('/')
            if not submission_id:
                return self.send_error_json(HTTPStatus.BAD_REQUEST, 'Submission id required')
            try:
                return self.send_json(generate_or_fetch_portrait(submission_id))
            except KeyError:
                return self.send_error_json(HTTPStatus.NOT_FOUND, 'Submission not found')
            except RuntimeError as exc:
                return self.send_error_json(HTTPStatus.SERVICE_UNAVAILABLE, str(exc))
        if path == '/api/tff/export.json':
            if not is_admin(self.headers):
                return self.send_error_json(HTTPStatus.UNAUTHORIZED, 'Admin password required')
            return self.send_json(export_json(fetch_rows()))
        if path == '/api/tff/export.csv':
            if not is_admin(self.headers):
                return self.send_error_json(HTTPStatus.UNAUTHORIZED, 'Admin password required')
            body = export_csv(fetch_rows()).encode('utf-8')
            self.send_response(HTTPStatus.OK)
            self.send_common_headers('text/csv; charset=utf-8')
            self.send_header('Content-Length', str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        self.send_error_json(HTTPStatus.NOT_FOUND, 'Not found')

    def do_DELETE(self):
        path = urlparse(self.path).path
        prefix = '/api/tff/submissions/'
        if not path.startswith(prefix):
            return self.send_error_json(HTTPStatus.NOT_FOUND, 'Not found')
        if not is_admin(self.headers):
            return self.send_error_json(HTTPStatus.UNAUTHORIZED, 'Admin username and password required')
        submission_id = path[len(prefix):].strip()
        if not submission_id:
            return self.send_error_json(HTTPStatus.BAD_REQUEST, 'Submission id required')
        deleted = delete_submission(submission_id)
        return self.send_json({'ok': True, 'deleted': deleted})

    def do_POST(self):
        path = urlparse(self.path).path
        if path.startswith('/api/tff/submissions/') and path.endswith('/portrait'):
            submission_id = path.removeprefix('/api/tff/submissions/').removesuffix('/portrait').strip('/')
            if not submission_id:
                return self.send_error_json(HTTPStatus.BAD_REQUEST, 'Submission id required')
            try:
                return self.send_json(generate_or_fetch_portrait(submission_id))
            except KeyError:
                return self.send_error_json(HTTPStatus.NOT_FOUND, 'Submission not found')
            except RuntimeError as exc:
                return self.send_error_json(HTTPStatus.SERVICE_UNAVAILABLE, str(exc))
        if path != '/api/tff/submissions':
            return self.send_error_json(HTTPStatus.NOT_FOUND, 'Not found')
        length = int(self.headers.get('content-length', '0') or '0')
        body = self.rfile.read(length)
        try:
            payload = validate_submission(parse_json(body))
            store_submission(payload)
        except json.JSONDecodeError:
            return self.send_error_json(HTTPStatus.BAD_REQUEST, 'Invalid JSON')
        except ValueError as exc:
            return self.send_error_json(HTTPStatus.BAD_REQUEST, str(exc))
        return self.send_json({'ok': True})

    def send_common_headers(self, content_type: str = 'application/json; charset=utf-8'):
        self.send_header('Content-Type', content_type)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Headers', 'content-type, x-tff-admin-username, x-tff-admin-password')
        self.send_header('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS')

    def send_json(self, payload: dict, status: HTTPStatus = HTTPStatus.OK):
        body = json.dumps(payload, ensure_ascii=False, indent=2).encode('utf-8')
        self.send_response(status)
        self.send_common_headers()
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def send_error_json(self, status: HTTPStatus, message: str):
        self.send_json({'ok': False, 'error': message}, status=status)


def count_submissions() -> int:
    with LOCK, ensure_db() as conn:
        row = conn.execute('SELECT COUNT(*) AS count FROM submissions').fetchone()
        return int(row['count'])


def fetch_rows() -> list[sqlite3.Row]:
    with LOCK, ensure_db() as conn:
        rows = conn.execute('SELECT * FROM submissions ORDER BY datetime(created_at) DESC, created_at DESC').fetchall()
        return rows


def fetch_submissions() -> list[dict]:
    return [submission_payload(row) for row in fetch_rows()]


def fetch_row_by_id(submission_id: str) -> sqlite3.Row | None:
    with LOCK, ensure_db() as conn:
        return conn.execute('SELECT * FROM submissions WHERE id = ?', (submission_id,)).fetchone()


def generate_or_fetch_portrait(submission_id: str) -> dict:
    row = fetch_row_by_id(submission_id)
    if row is None:
        raise KeyError(submission_id)
    payload = json.loads(row['payload_json'])
    existing = payload.get('portrait') or {}
    if existing.get('dataUrl'):
        return {'ok': True, 'cached': True, 'portrait': existing}
    if not OPENAI_API_KEY:
        return {
            'ok': False,
            'queued': False,
            'error': 'Image generation is not configured yet.',
            'portraitPrompt': build_portrait_prompt(payload),
        }

    prompt = build_portrait_prompt(payload)
    data_url = request_portrait_image(prompt)
    portrait = {
        'dataUrl': data_url,
        'prompt': prompt,
        'model': IMAGE_MODEL,
        'quality': IMAGE_QUALITY,
        'generatedAt': now_iso(),
    }
    payload['portrait'] = portrait
    update_submission_payload(submission_id, payload)
    return {'ok': True, 'cached': False, 'portrait': portrait}


def request_portrait_image(prompt: str) -> str:
    request_payload = json.dumps({
        'model': IMAGE_MODEL,
        'prompt': prompt,
        'size': '1024x1024',
        'quality': IMAGE_QUALITY,
        'background': 'opaque',
        'n': 1,
    }).encode('utf-8')
    request = urllib.request.Request(
        'https://api.openai.com/v1/images/generations',
        data=request_payload,
        headers={
            'Authorization': f'Bearer {OPENAI_API_KEY}',
            'Content-Type': 'application/json',
        },
        method='POST',
    )
    try:
        with urllib.request.urlopen(request, timeout=90) as response:
            data = json.loads(response.read().decode('utf-8'))
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode('utf-8', errors='replace')
        raise RuntimeError(f'Image generation failed: {detail[:300]}') from exc
    except Exception as exc:
        raise RuntimeError(f'Image generation failed: {exc}') from exc

    image = (data.get('data') or [{}])[0]
    b64_json = image.get('b64_json')
    if b64_json:
        return f'data:image/png;base64,{b64_json}'
    url = image.get('url')
    if url:
        with urllib.request.urlopen(url, timeout=90) as response:
            encoded = base64.b64encode(response.read()).decode('ascii')
        return f'data:image/png;base64,{encoded}'
    raise RuntimeError('Image generation returned no image data')


def update_submission_payload(submission_id: str, payload: dict):
    with LOCK, ensure_db() as conn:
        conn.execute('UPDATE submissions SET payload_json = ? WHERE id = ?', (json.dumps(payload, ensure_ascii=False), submission_id))
        conn.commit()


def delete_submission(submission_id: str) -> int:
    with LOCK, ensure_db() as conn:
        cur = conn.execute('DELETE FROM submissions WHERE id = ?', (submission_id,))
        conn.commit()
        return cur.rowcount


def store_submission(payload: dict):
    with LOCK, ensure_db() as conn:
        conn.execute(
            '''
            INSERT OR REPLACE INTO submissions
            (id, created_at, name, role, show_name_in_presentation, predicted_style, primary_style, secondary_style, payload_json)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''',
            (
                payload['id'],
                payload['createdAt'],
                str(payload.get('name', '')).strip(),
                clean_text(payload.get('role', '')).strip(),
                1 if payload.get('showNameInPresentation') else 0,
                clean_text(payload.get('predictedStyle', 'Not sure')),
                clean_text(payload.get('primaryStyle', '')),
                clean_text(payload.get('secondaryStyle', '')),
                json.dumps(payload, ensure_ascii=False),
            ),
        )
        conn.commit()


def clean_text(value) -> str:
    if value is None:
        return ''
    return str(value)


def main():
    server = ThreadingHTTPServer((HOST, PORT), Handler)
    print(f'TFF API running on http://{HOST}:{PORT} using {DB_PATH}')
    server.serve_forever()


if __name__ == '__main__':
    main()

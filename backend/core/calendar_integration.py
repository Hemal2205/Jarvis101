import datetime
from typing import List, Dict, Any

# Google Calendar imports
try:
    from googleapiclient.discovery import build
    from google_auth_oauthlib.flow import InstalledAppFlow
    from google.auth.transport.requests import Request
    import pickle
except ImportError:
    build = None
    InstalledAppFlow = None
    Request = None
    pickle = None

# Outlook Calendar imports
try:
    from O365 import Account, FileSystemTokenBackend
except ImportError:
    Account = None
    FileSystemTokenBackend = None

SCOPES = ['https://www.googleapis.com/auth/calendar.readonly']
O365_SCOPES = ['basic', 'calendar_all']

class CalendarIntegration:
    def __init__(self):
        self.google_creds = None
        self.outlook_account = None
        self._init_google()
        self._init_outlook()

    def _init_google(self):
        if not build:
            return
        try:
            import os
            creds = None
            if os.path.exists('token_google.pickle'):
                with open('token_google.pickle', 'rb') as token:
                    creds = pickle.load(token)
            if not creds or not creds.valid:
                if creds and creds.expired and creds.refresh_token:
                    creds.refresh(Request())
                else:
                    flow = InstalledAppFlow.from_client_secrets_file('credentials_google.json', SCOPES)
                    creds = flow.run_local_server(port=0)
                with open('token_google.pickle', 'wb') as token:
                    pickle.dump(creds, token)
            self.google_creds = creds
        except Exception as e:
            print(f"Google Calendar auth error: {e}")
            self.google_creds = None

    def _init_outlook(self):
        if not Account:
            return
        try:
            credentials = ('client_id', 'client_secret')  # Replace with your app credentials
            token_backend = FileSystemTokenBackend(token_path='.', token_filename='o365_token.txt')
            account = Account(credentials, token_backend=token_backend, scopes=O365_SCOPES)
            if not account.is_authenticated:
                account.authenticate(scopes=O365_SCOPES)
            self.outlook_account = account
        except Exception as e:
            print(f"Outlook Calendar auth error: {e}")
            self.outlook_account = None

    def get_upcoming_events(self, max_results=10) -> List[Dict[str, Any]]:
        events = []
        # Google Calendar events
        if self.google_creds and build:
            try:
                service = build('calendar', 'v3', credentials=self.google_creds)
                now = datetime.datetime.utcnow().isoformat() + 'Z'
                result = service.events().list(calendarId='primary', timeMin=now,
                                               maxResults=max_results, singleEvents=True,
                                               orderBy='startTime').execute()
                for event in result.get('items', []):
                    events.append({
                        'summary': event.get('summary'),
                        'start': event['start'].get('dateTime', event['start'].get('date')),
                        'end': event['end'].get('dateTime', event['end'].get('date')),
                        'link': event.get('hangoutLink') or event.get('htmlLink'),
                        'source': 'google'
                    })
            except Exception as e:
                print(f"Google Calendar fetch error: {e}")
        # Outlook Calendar events
        if self.outlook_account:
            try:
                schedule = self.outlook_account.schedule()
                calendar = schedule.get_default_calendar()
                now = datetime.datetime.utcnow()
                q = calendar.new_query('start').greater_equal(now)
                for event in calendar.get_events(query=q, limit=max_results):
                    events.append({
                        'summary': event.subject,
                        'start': event.start.strftime('%Y-%m-%dT%H:%M:%S'),
                        'end': event.end.strftime('%Y-%m-%dT%H:%M:%S'),
                        'link': event.get_online_meeting_url(),
                        'source': 'outlook'
                    })
            except Exception as e:
                print(f"Outlook Calendar fetch error: {e}")
        return events

    def get_imminent_meetings(self, minutes=10) -> List[Dict[str, Any]]:
        imminent = []
        now = datetime.datetime.utcnow()
        events = self.get_upcoming_events(max_results=20)
        for event in events:
            try:
                start = event['start']
                if 'T' in start:
                    start_dt = datetime.datetime.fromisoformat(start.replace('Z', ''))
                else:
                    continue
                delta = (start_dt - now).total_seconds() / 60
                if 0 <= delta <= minutes:
                    imminent.append(event)
            except Exception:
                continue
        return imminent 
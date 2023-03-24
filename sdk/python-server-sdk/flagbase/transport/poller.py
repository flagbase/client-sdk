import threading
import requests

from flagbase.context import Context
from flagbase.events import Events, EventType

class Poller:
    def __init__(self, context: Context, events: Events):
        self.context = context
        self.events = events
        self._stop_event = threading.Event()
        self._polling_thread = None

    def _poll(self):
        try:
            polling_service_url = self.context.get_config().get_polling_service_url()
            polling_interval_ms = self.context.get_config().get_polling_interval_ms()
            if polling_interval_ms < 3000:
                polling_interval_ms = 3000

            etag = 'initial'
            while not self._stop_event.is_set():
                response = requests.get(polling_service_url, headers={
                    'x-sdk-key': self.context.get_config().get_server_key(),
                    'ETag': etag
                })

                if response.status_code == 200:
                    data = response.json()["data"]
                    etag = response.headers["Etag"]

                    for raw_flag in data:
                        self.context.get_raw_flags().add_flag(raw_flag["attributes"])
                    
                    self.events.emit(
                        event_name=EventType.NETWORK_FETCH_FULL,
                        event_message="Retrieved full flagset from service.", 
                        event_context=self.context.get_raw_flags().get_flags())

                elif response.status_code == 304:
                    self.events.emit(
                        event_name=EventType.NETWORK_FETCH_CACHED,
                        event_message="Retrieved cached flagset from service.")

                elif response.status_code != 200 or response.status_code != 304:
                    msg = f"Unexpected response from poller [{polling_service_url}], with status code {response.status_code}: {response.json()}"
                    raise Exception(msg)

                self._stop_event.wait(polling_interval_ms / 1000)
        except e:
            print(f"[Flagbase]: Something went wrong when trying to retrieve rules from server... Error: {e}")
            pass

    def start(self):
        if self._polling_thread is None or not self._polling_thread.is_alive():
            self._stop_event.clear()
            self._polling_thread = threading.Thread(target=self._poll, daemon=True)
            self._polling_thread.start()

    def stop(self):
        if self._polling_thread and self._polling_thread.is_alive():
            self._stop_event.set()
            self._polling_thread.join()
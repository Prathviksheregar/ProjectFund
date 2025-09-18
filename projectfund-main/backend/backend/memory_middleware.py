
import logging
import sys

class MemoryUsageMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        # Only log memory usage if not on Windows
        if sys.platform != "win32":
            import resource
            usage = resource.getrusage(resource.RUSAGE_SELF).ru_maxrss
            logging.info(f"Memory usage: {usage/1024:.2f} MB for {request.path}")
        return response
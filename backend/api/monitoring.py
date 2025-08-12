from fastapi import APIRouter
from fastapi.responses import JSONResponse
from datetime import datetime
import psutil

router = APIRouter()

def get_active_window():
    try:
        import win32gui
        window = win32gui.GetForegroundWindow()
        return win32gui.GetWindowText(window)
    except Exception:
        return None

@router.get("/api/monitor/status")
async def get_monitor_status():
    cpu_percent = psutil.cpu_percent(interval=0.5)
    cpu_temp = None
    try:
        temps = psutil.sensors_temperatures()
        if temps:
            for name, entries in temps.items():
                for entry in entries:
                    if entry.current:
                        cpu_temp = entry.current
                        break
    except Exception:
        cpu_temp = None

    mem = psutil.virtual_memory()
    disk = psutil.disk_usage('/')
    net = psutil.net_io_counters()
    active_window = get_active_window()
    process_names = [p.info['name'] for p in psutil.process_iter(['name']) if p.info['name']]

    # Get live running applications
    applications = []
    try:
        for p in psutil.process_iter(['name']):
            name = p.info.get('name')
            if name:
                applications.append(name)
    except Exception:
        applications = []

    metrics = {
        "success": True,
        "system_status": {
            "cpu": {
                "usage": cpu_percent,
                "temperature": cpu_temp or 0,
                "cores": psutil.cpu_count(logical=True)
            },
            "memory": {
                "usage": mem.percent,
                "available": round(mem.available / (1024 ** 3), 2),
                "total": round(mem.total / (1024 ** 3), 2)
            },
            "disk": {
                "usage": disk.percent,
                "free": round(disk.free / (1024 ** 3), 2),
                "total": round(disk.total / (1024 ** 3), 2)
            },
            "network": {
                "latency": 0,  # You can add a ping test for real latency
                "bandwidth": net.bytes_sent + net.bytes_recv
            },
            "applications": process_names,
            "active_window": active_window,
            "last_update": datetime.now().isoformat(),
        },
        "performance_alerts": [],
        "user_activity": {
            "last_mouse_move": None,
            "last_keyboard_input": None,
            "active_applications": process_names,
            "session_duration": 0,
        },
        "performance_summary": {
            "average_cpu": cpu_percent,
            "average_memory": mem.percent,
            "average_disk": disk.percent,
            "average_latency": 0,
            "active_alerts": 0,
            "session_duration": 0,
            "active_applications": len(process_names),
        }
    }
    return JSONResponse({"success": True, "system_status": metrics}) 
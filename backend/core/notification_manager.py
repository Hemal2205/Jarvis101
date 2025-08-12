from sqlalchemy.orm import Session
from .models import Notification as NotificationModel, User as UserModel, Device
from datetime import datetime
from typing import Dict, Any, List, Optional
try:
    from pyfcm import FCMNotification
except ImportError:
    FCMNotification = None

FCM_SERVER_KEY = "<YOUR_FCM_SERVER_KEY>"  # TODO: Replace with your actual FCM server key

class NotificationManager:
    def create_notification(self, db: Session, user_id: int, message: str, type: str = 'general', data: dict = None) -> Dict[str, Any]:
        if data is None:
            data = {}
        notification = NotificationModel(
            user_id=user_id,
            message=message,
            type=type,
            data=data,
            is_read=False,
            created_at=datetime.now()
        )
        db.add(notification)
        db.commit()
        db.refresh(notification)
        # Send push notification to all devices if FCMNotification is available
        if FCMNotification and FCM_SERVER_KEY != "<YOUR_FCM_SERVER_KEY>":
            devices = db.query(Device).filter_by(user_id=user_id).all()
            tokens = [d.push_token for d in devices if d.push_token]
            if tokens:
                self.send_push(tokens, message)
        return {"success": True, "notification_id": notification.id, "notification": self._serialize_notification(notification)}

    def list_notifications(self, db: Session, user_id: int, unread_only: bool = False) -> List[Dict[str, Any]]:
        query = db.query(NotificationModel).filter_by(user_id=user_id)
        if unread_only:
            query = query.filter_by(is_read=False)
        notifications = query.order_by(NotificationModel.created_at.desc()).all()
        return [self._serialize_notification(n) for n in notifications]

    def mark_as_read(self, db: Session, notification_id: int) -> Dict[str, Any]:
        notification = db.query(NotificationModel).filter_by(id=notification_id).first()
        if not notification:
            return {"success": False, "message": "Notification not found"}
        notification.is_read = True
        db.commit()
        return {"success": True, "notification": self._serialize_notification(notification)}

    def send_push(self, push_tokens: list, message: str) -> bool:
        if not FCMNotification or FCM_SERVER_KEY == "<YOUR_FCM_SERVER_KEY>":
            return False
        push_service = FCMNotification(api_key=FCM_SERVER_KEY)
        success = True
        for token in push_tokens:
            result = push_service.notify_single_device(registration_id=token, message_body=message)
            if result.get("success", 0) != 1:
                success = False
        return success

    def _serialize_notification(self, notification: NotificationModel) -> Dict[str, Any]:
        return {
            "id": notification.id,
            "user_id": notification.user_id,
            "message": notification.message,
            "type": notification.type,
            "data": notification.data,
            "is_read": notification.is_read,
            "created_at": notification.created_at.isoformat() if notification.created_at else None
        } 
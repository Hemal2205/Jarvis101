from sqlalchemy.orm import Session
from .models import Video as VideoModel, User as UserModel
from datetime import datetime
from typing import Dict, Any, List, Optional

class VideoManager:
    def upload_video(self, db: Session, user_id: int, file_path: str, description: str = "") -> Dict[str, Any]:
        video = VideoModel(
            user_id=user_id,
            file_path=file_path,
            description=description,
            created_at=datetime.now()
        )
        db.add(video)
        db.commit()
        db.refresh(video)
        return {"success": True, "video_id": video.id, "video": self._serialize_video(video)}

    def list_videos(self, db: Session, user_id: int) -> List[Dict[str, Any]]:
        videos = db.query(VideoModel).filter_by(user_id=user_id).order_by(VideoModel.created_at.desc()).all()
        return [self._serialize_video(v) for v in videos]

    def get_video(self, db: Session, video_id: int) -> Optional[Dict[str, Any]]:
        video = db.query(VideoModel).filter_by(id=video_id).first()
        return self._serialize_video(video) if video else None

    def delete_video(self, db: Session, video_id: int) -> Dict[str, Any]:
        video = db.query(VideoModel).filter_by(id=video_id).first()
        if not video:
            return {"success": False, "message": "Video not found"}
        db.delete(video)
        db.commit()
        return {"success": True, "message": "Video deleted"}

    def _serialize_video(self, video: VideoModel) -> Dict[str, Any]:
        return {
            "id": video.id,
            "user_id": video.user_id,
            "file_path": video.file_path,
            "description": video.description,
            "created_at": video.created_at.isoformat() if video.created_at else None
        } 
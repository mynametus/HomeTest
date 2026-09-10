import { useEffect, useRef } from "react";

type ContextMenuProps = {
  x: number;
  y: number;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
};

export function ContextMenu({ x, y, onEdit, onDelete, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        onClose();
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const left = Math.min(x, window.innerWidth - 160);
  const top = Math.min(y, window.innerHeight - 90);

  return (
    <div
      ref={menuRef}
      className="fixed z-50 min-w-[140px] overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
      style={{ left, top }}
    >
      <button
        type="button"
        className="block w-full px-4 py-2 text-left text-sm text-gray-800 hover:bg-gray-100"
        onClick={onEdit}
      >
        Edit
      </button>
      <button
        type="button"
        className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
        onClick={onDelete}
      >
        Delete
      </button>
    </div>
  );
}

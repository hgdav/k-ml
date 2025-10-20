import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export function SortableItem({ id, children }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            className="flex items-center gap-3 bg-gray-800 rounded-lg shadow-md p-3 transition"
        >
            <button
                {...listeners}
                className="cursor-grab touch-none p-1 text-xl text-gray-400 hover:text-white rounded"
                aria-label="Mover elemento"
            >
                ☰
            </button>

            <div className="flex-grow">
                {children}
            </div>
        </div>
    );
}
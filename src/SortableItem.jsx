import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export function SortableItem({ id, children, handle }) {
    const { setNodeRef, attributes, listeners, transform, transition } =
        useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        touchAction: "none",
    };

    return (
        <div ref={setNodeRef} style={style} className="flex items-center gap-2">
            <div
                {...attributes}
                {...listeners}
                className="cursor-grab text-gray-400 hover:text-white select-none px-2"
            >
                ☰
            </div>

            <div className="flex-1">{children}</div>
        </div>
    );
}

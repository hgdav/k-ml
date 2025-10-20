// SortableItem.jsx
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
        isDragging, // Importante para el feedback visual
    } = useSortable({ id });

    // CAMBIO 1: Estilos mejorados para el feedback visual durante el arrastre.
    // Cuando un item está siendo arrastrado, lo hacemos un poco más grande,
    // le damos sombra y lo ponemos por encima de los demás (z-index).
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.8 : 1,
        boxShadow: isDragging ? "0px 5px 15px rgba(0,0,0,0.3)" : "none",
        transform: isDragging ? `scale(1.02) ${CSS.Transform.toString(transform)}` : CSS.Transform.toString(transform),
        zIndex: isDragging ? 10 : 'auto',
    };

    return (
        // CAMBIO 2: Los {...attributes} se aplican al div principal para la accesibilidad.
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            className="flex items-center gap-3 bg-gray-800 rounded-lg shadow-md p-3 transition-all" // Usamos transition-all
        >
            {/* Handle de Arrastre */}
            <button
                {...listeners} // CAMBIO 3: Los {...listeners} van SOLAMENTE en el botón del handle.
                className="cursor-grab touch-none p-1 text-xl text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                aria-label="Mover elemento"
            >
                ☰
            </button>

            {/* Contenido del item */}
            <div className="flex-grow">
                {children}
            </div>
        </div>
    );
}
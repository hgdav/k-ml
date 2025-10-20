import { useEffect, useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableItem } from "./SortableItem";

const STATUS = {
  PENDIENTE: "Pendiente",
  EN_PROCESO: "En proceso",
  COMPLETADO: "Completado",
};

export default function App() {
  const [heroes, setHeroes] = useState([]);
  const [statusMap, setStatusMap] = useState({});

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    fetch("./assets/mages.json")
      .then((res) => res.json())
      .then((data) => {
        const savedOrder = JSON.parse(localStorage.getItem("heroOrder"));
        if (savedOrder) {
          const ordered = savedOrder
            .map((name) => data.find((h) => h.name === name))
            .filter(Boolean);
          const remaining = data.filter(
            (h) => !savedOrder.includes(h.name)
          );
          setHeroes([...ordered, ...remaining]);
        } else {
          setHeroes(data);
        }
      })
      .catch((err) => console.error("Error al cargar heroes:", err));
  }, []);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("heroStatus") || "{}");
    setStatusMap(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem("heroStatus", JSON.stringify(statusMap));
  }, [statusMap]);

  const changeStatus = (heroName) => {
    const current = statusMap[heroName] || STATUS.PENDIENTE;
    const next =
      current === STATUS.PENDIENTE
        ? STATUS.EN_PROCESO
        : current === STATUS.EN_PROCESO
          ? STATUS.COMPLETADO
          : STATUS.PENDIENTE;
    setStatusMap((prev) => ({ ...prev, [heroName]: next }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case STATUS.EN_PROCESO:
        return "bg-yellow-500 text-black";
      case STATUS.COMPLETADO:
        return "bg-green-500 text-white";
      default:
        return "bg-red-500 text-white";
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setHeroes((prevHeroes) => {
        const oldIndex = prevHeroes.findIndex((h) => h.name === active.id);
        const newIndex = prevHeroes.findIndex((h) => h.name === over.id);
        const newOrder = arrayMove(prevHeroes, oldIndex, newIndex);
        localStorage.setItem("heroOrder", JSON.stringify(newOrder.map((h) => h.name)));
        return newOrder;
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">

      {heroes.length === 0 ? (
        <p className="text-center text-gray-400">Cargando héroes...</p>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={heroes.map((h) => h.name)}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col gap-3 max-w-md mx-auto">
              {heroes.map((hero) => {
                const estado = statusMap[hero.name] || STATUS.PENDIENTE;
                return (
                  <SortableItem key={hero.name} id={hero.name}>
                    <div className="bg-gray-800 rounded-lg shadow-md p-3 flex items-center justify-between hover:bg-gray-700 transition w-full">
                      <div className="flex items-center gap-3">
                        <img
                          src={hero.image}
                          alt={hero.name}
                          className="w-12 h-12 rounded-md object-cover"
                        />
                        <h3 className="font-semibold text-lg">{hero.name}</h3>
                      </div>
                      <button
                        onClick={() => changeStatus(hero.name)}
                        className={`px-3 py-1 text-sm font-medium rounded ${getStatusColor(
                          statusMap[hero.name] || STATUS.PENDIENTE
                        )}`}
                      >
                        {statusMap[hero.name] || STATUS.PENDIENTE}
                      </button>
                    </div>
                  </SortableItem>

                );
              })}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}

import { useEffect, useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
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

const getInitialStatus = () => {
  try {
    const savedStatus = localStorage.getItem("heroStatus");
    return savedStatus ? JSON.parse(savedStatus) : {};
  } catch (error) {
    console.error("No se pudo cargar el estado de los héroes:", error);
    return {};
  }
};


export default function App() {
  const [heroes, setHeroes] = useState([]);
  const [statusMap, setStatusMap] = useState(getInitialStatus);
  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    fetch("./assets/mages.json")
      .then((res) => res.json())
      .then((data) => {
        try {
          const savedOrderJSON = localStorage.getItem("heroOrder");
          if (savedOrderJSON) {
            const savedOrder = JSON.parse(savedOrderJSON);
            const ordered = savedOrder
              .map((name) => data.find((h) => h.name === name))
              .filter(Boolean);
            const remaining = data.filter((h) => !savedOrder.includes(h.name));
            setHeroes([...ordered, ...remaining]);
          } else {
            setHeroes(data);
          }
        } catch (error) {
          console.error("Error al cargar el orden, usando orden por defecto:", error);
          setHeroes(data);
        }
      });
  }, []);

  useEffect(() => {
    localStorage.setItem("heroStatus", JSON.stringify(statusMap));
  }, [statusMap]);

  function handleDragStart(event) {
    const { active } = event;
    setActiveId(active.id);
  }

  function handleDragEnd(event) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setHeroes((items) => {
        const oldIndex = items.findIndex((h) => h.name === active.id);
        const newIndex = items.findIndex((h) => h.name === over.id);
        const newOrder = arrayMove(items, oldIndex, newIndex);

        localStorage.setItem("heroOrder", JSON.stringify(newOrder.map((h) => h.name)));

        return newOrder;
      });
    }

    setActiveId(null);
  }

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

  const activeHero = activeId ? heroes.find((h) => h.name === activeId) : null;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 overflow-auto">
      {heroes.length === 0 ? (
        <p className="text-center text-gray-400">Cargando héroes...</p>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={heroes.map((h) => h.name)}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col gap-3 max-w-md mx-auto">
              {heroes.map((hero) => (
                <SortableItem key={hero.name} id={hero.name}>
                  <div className="flex items-center justify-between w-full">
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
                      className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${getStatusColor(
                        statusMap[hero.name] || STATUS.PENDIENTE
                      )}`}
                    >
                      {statusMap[hero.name] || STATUS.PENDIENTE}
                    </button>
                  </div>
                </SortableItem>
              ))}
            </div>
          </SortableContext>

          <DragOverlay>
            {activeId && activeHero ? (
              <div className="flex items-center gap-3 bg-gray-700 rounded-lg shadow-xl p-3">
                <span className="cursor-grabbing text-xl text-gray-400">☰</span>
                <div className="flex-grow">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                      <img
                        src={activeHero.image}
                        alt={activeHero.name}
                        className="w-12 h-12 rounded-md object-cover"
                      />
                      <h3 className="font-semibold text-lg">{activeHero.name}</h3>
                    </div>
                    <button
                      className={`px-3 py-1 text-sm font-medium rounded-md ${getStatusColor(
                        statusMap[activeHero.name] || STATUS.PENDIENTE
                      )}`}
                    >
                      {statusMap[activeHero.name] || STATUS.PENDIENTE}
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  );
}
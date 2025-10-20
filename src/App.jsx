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

// CAMBIO 1: Función para cargar el estado inicial de los héroes desde localStorage.
// Es más seguro hacerlo así para evitar errores si el JSON está malformado.
const getInitialStatus = () => {
  try {
    const savedStatus = localStorage.getItem("heroStatus");
    // Si hay algo guardado, lo parseamos. Si no, devolvemos un objeto vacío.
    return savedStatus ? JSON.parse(savedStatus) : {};
  } catch (error) {
    console.error("Error al parsear el estado de los héroes:", error);
    // Si hay un error (ej. JSON corrupto), devolvemos un objeto vacío para no bloquear la app.
    return {};
  }
};


export default function App() {
  const [heroes, setHeroes] = useState([]);

  // CAMBIO 2: Inicializamos el estado directamente desde la función que lee el localStorage.
  const [statusMap, setStatusMap] = useState(getInitialStatus);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );


  useEffect(() => {
    fetch("./assets/mages.json")
      .then((res) => res.json())
      .then((data) => {
        try {
          // CAMBIO 3: Hacemos más segura la carga del orden.
          const savedOrderJSON = localStorage.getItem("heroOrder");
          if (savedOrderJSON) {
            const savedOrder = JSON.parse(savedOrderJSON);
            const ordered = savedOrder
              .map((name) => data.find((h) => h.name === name))
              .filter(Boolean); // filter(Boolean) es un truco genial para eliminar nulos o undefined.

            const remaining = data.filter(
              (h) => !savedOrder.includes(h.name)
            );
            setHeroes([...ordered, ...remaining]);
          } else {
            setHeroes(data);
          }
        } catch (error) {
          console.error("Error al cargar el orden de los héroes, usando orden por defecto:", error);
          setHeroes(data); // Si hay error, cargamos los datos por defecto.
        }
      });
  }, []);

  // CAMBIO 4: Eliminamos el `useEffect` que cargaba el statusMap, porque ya lo hacemos en useState.

  // Este useEffect para guardar el estado ahora funciona perfectamente.
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
    if (active.id && over && active.id !== over.id) { // Añadida comprobación de que 'over' existe.
      setHeroes((prevHeroes) => {
        const oldIndex = prevHeroes.findIndex((h) => h.name === active.id);
        const newIndex = prevHeroes.findIndex((h) => h.name === over.id);

        if (oldIndex === -1 || newIndex === -1) return prevHeroes; // Seguridad extra

        const newOrder = arrayMove(prevHeroes, oldIndex, newIndex);
        localStorage.setItem("heroOrder", JSON.stringify(newOrder.map((h) => h.name)));
        return newOrder;
      });
    }
  };

  return (
    // CAMBIO 5: Pequeños ajustes para mejorar la experiencia en móviles.
    <div className="min-h-screen bg-gray-900 text-white p-6 overflow-auto" >
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
        </DndContext>
      )}
    </div>
  );
}
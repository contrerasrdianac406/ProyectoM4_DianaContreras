import { useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/Authenticator";
import "./DashboardPage.css";
import { useEffect, useState } from "react";
import type { Task } from "../types/types";
import { addTask, deleteTask, getTasks, updateTask } from "../services/taskServices";
import Button from "../ui/Button/Button";


const DashboardPage = () => {

  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState<Task []> ([]);
  const [isloading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("") ;
  const [description, setDescription] = useState("");
// Estados para la edición en línea de una tarea
    const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState("");
    const [editDescription, setEditDescription] = useState("");




  useEffect(() => {

    const loadTasks = async () => {
      try{
        const  data = await getTasks(user?.uid);
        setTasks (data);
      } catch(err){
        setError("Error al cargar las tareas");
      } finally {
        setIsLoading(false);
      }
    };
    loadTasks();
    
  }, []);

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();

    setIsLoading(true);

    try {
      const newTask = await addTask({
        title: title,
        description: description,
        completed: false,
        userId: user?.uid ?? "unknown",
        createdAt: new Date().toISOString(),
      });
      setTasks([...tasks, newTask]);
      setTitle("");
    setDescription("");
    } catch {
      setError("Error al crear la tarea");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = async (task: Task) => {
    setIsLoading(true);

    try {
      const updatedTask = await updateTask({
        ...task,
        completed: !task.completed,
      });
      setTasks(
        tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task)),
      );
      setTitle("");
    } catch {
      setError("Error al actualizar la tarea");
    } finally {
      setIsLoading(false);
    }
  };


  const handleDelete = async (task: Task) => {
    setIsLoading(true);

    try {
      const deletedTask = await deleteTask(task);
      setTasks(tasks.filter((task) => task.id !== deletedTask.id));
      setTitle("");
    } catch {
      setError("Error al borrar la tarea");
    } finally {
      setIsLoading(false);
    }
  };

  // Inicia la edicion en linea de la tarea seleccionada
  const handleEditar = (task: Task) => {
    setEditingTaskId(task.id);
    setEditTitle(task.title);
    setEditDescription(task.description);
  };

  // Guarda los cambios de titulo y descripcion de la tarea editada
  const handleSaveEdit = async (task: Task) => {
    setIsLoading(true);

    try {
      const updatedTask = await updateTask({
        ...task,
        title: editTitle,
        description: editDescription,
      });
      setTasks(tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
      setEditingTaskId(null);
      setEditTitle("");
      setEditDescription("");
    } catch {
      setError("Error al editar la tarea");
    } finally {
      setIsLoading(false);
    }
  };

  // Cancela la edicion y descarta los cambios
  const handleCancelEdit = () => {
    setEditingTaskId(null);
    setEditTitle("");
    setEditDescription("");
  };
 
  // Early return

  if(isloading){
      return (
      <div className="dashboard-page">
      <div className="dashboard-card">
        <h1>Cargando tareas ....</h1>
      </div>
      </div>
      
    );
    }
  // Early return
    if(error){
      return (
      <div className="dashboard-page">
      <div className="dashboard-card">
          <h1>Error:{error}</h1>
        </div>
      </div>
      );
    }

  const handleCloseSession = async () => {
    try {
      await logout();
    } catch {
      navigate("/login");
    }
  };

  return (
  <div className="dashboard-page">

        <div className="dashboard-card">
        <h1>Mi Dashboard</h1>
        <p className="subtitle">Bienvenido a tu panel de tareas</p>
        <div className="user-info">
          <div className="user-icon">
            {user?.email?.charAt(0).toUpperCase() || "U"}
          </div>
          <p className="user-email">{user?.email}</p>
          <p className="user-id">ID: {user?.uid}</p>
        </div>
        <button className="btn-logout" onClick={handleCloseSession}>
          Cerrar sesion
        </button>
      </div>
      <br />

    <section className="dashboard-card2">
      <h1>Tareas</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="task-title">Nueva tarea:</label>
        <input
          id="task-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Escribí una tarea"
          />
        <br/>
        <label htmlFor="task-description">Descripción:</label>
          <input
          id="task-description"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Escribí una descripción"
          />
        <br/>
        {/* Esta validacion es simple, debe ser mejorada y mas exacta */}
        <Button type="submit" disabled={title.length < 2}>
          Agregar
        </Button>
      </form>
      <br />
      {tasks.length !== 0 ? (
        tasks.map((task, i) => (
          // Se pueden agregar inline edition para otros campos, por ejemplo el title
          <div key={i}>
            {editingTaskId === task.id ? (
              <>
                <input
                  className="task-edit-input"
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Título"
                />
                <input
                  className="task-edit-input"
                  type="text"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Descripción"
                />
                <Button
                  onClick={() => void handleSaveEdit(task)}
                  disabled={editTitle.length < 2}
                >
                  Guardar
                </Button>
                <Button variant="ghost" onClick={handleCancelEdit}>
                  Cancelar
                </Button>
              </>
            ) : (
              <>
                <p>Tarea:{task.title}</p>
                <p>Descripción:{task.description}</p>
                <p>
                  {task.completed ? "Completada" : "Pendiente"} ·{" "}
                  {new Date(task.createdAt).toLocaleString("es")}
                </p>
                <Button onClick={() => void handleToggle(task)}>
                  {task.completed ? "Marcar pendiente" : "Completar"}
                </Button>
                <Button onClick={() => handleEditar(task)}>Editar</Button>
                <Button variant="danger" onClick={() => void handleDelete(task)}>
                  Eliminar
                </Button>
              </>
            )}
          </div>
        ))
      ) : (
        <h2>No hay tareas</h2>
      )}
      </section>
      <br />

    </div>
  );
};

export default DashboardPage;


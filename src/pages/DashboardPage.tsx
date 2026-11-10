import { useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/Authenticator";
import "./DashboardPage.css";
import { useEffect, useState } from "react";
import type { Task } from "../types/types";
import { addTask, deleteTask, getTasks, updateTask } from "../services/taskServices";
import Button from "../ui/Button/Button";



// Estados para conexión de envio de correo
type FormStatus = "idle" | "loading" | "success" | "error";

type ApiResponse = {
  message?: string;
  error?: string;
  detail?: string;
};


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
  //Estados del correo
  const [status, setStatus] = useState<FormStatus>("idle");    
  const [feedback, setFeedback] = useState("");


  useEffect(() => {

    const loadTasks = async () => {
      try{
        const  data = await getTasks(user?.uid ?? "");
        setTasks (data);
      } catch(err){
        setError("Error al cargar las tareas");
      } finally {
        setIsLoading(false);
      }
    };
    loadTasks();
    
  }, []);

  // Oculta automaticamente el mensaje de feedback 4 segundos despues del resultado
  useEffect(() => {
    if (!feedback) return;
    if (status !== "success" && status !== "error") return;

    const timer = setTimeout(() => setFeedback(""), 4000);

    return () => clearTimeout(timer);
  }, [status, feedback]);

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    //setIsLoading(true);
      setStatus("loading");
      setFeedback("Enviando mensaje...");
    try {
      const newTask = await addTask({
        title: title,
        description: description,
        completed: false,
        userId: user?.uid ?? "unknown",
        createdAt: new Date().toISOString(),
      });
            //esto debemos crearlo
            const response = await fetch("/api/send-email", {
                method: "POST",
                //esto debemos crearlo
                headers: {
                "Content-Type": "application/json",
                },
                //esto debemos crearlo
                body: JSON.stringify({
                    name: user?.displayName ?? user?.email ?? "Usuario",
                    email: user?.email ?? "",
                    message: `Nueva tarea: ${title}\nDescripción: ${description}`,
                }),
            });
            //esto debemos crearlo con otra variable
            const data1 = (await response.json()) as ApiResponse;

            //esto debemos crearlo
            if (!response.ok) {
                const errorMessage = data1.error ?? "No se pudo enviar el mensaje";

                throw new Error(
                data1.detail ? `${errorMessage}: ${data1.detail}` : errorMessage,
                );
            }    
            
            //esto debemos crearlo
            setStatus("success");
            setFeedback(data1.message ?? "Mensaje enviado correctamente");

      setTasks([...tasks, newTask]);
      setTitle("");
    setDescription("");
    } catch (error) {
      setError("Error al crear la tarea");
      setStatus("error");
      setFeedback(
      error instanceof Error ? error.message : "Ocurrió un error inesperado",
      );

    } finally {
      setIsLoading(false);
    }
  };

  // Función para enviar reporte por correo electrónico con la misma lógica de handleSubmit
  const handleEnviarReporte = async (
    accion: string = "Reporte general de tareas",
    tareasActuales: Task[] = tasks
  ) => {
    setStatus("loading");
    setFeedback("Enviando reporte por correo...");

    const total = tareasActuales.length;
    const completadas = tareasActuales.filter((t) => t.completed).length;
    const pendientes = tareasActuales.filter((t) => !t.completed).length;

    const message =
      `Acción realizada: ${accion}\n\n` +
      `Estados actualizados:\n` +
      `1. Total tareas: ${total}\n` +
      `2. Tareas completadas: ${completadas}\n` +
      `3. Tareas Pendientes: ${pendientes}`;

    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: user?.displayName ?? user?.email ?? "Usuario",
          email: user?.email ?? "",
          message: message,
        }),
      });

      const data = (await response.json()) as ApiResponse;

      if (!response.ok) {
        const errorMessage = data.error ?? "No se pudo enviar el reporte";
        throw new Error(
          data.detail ? `${errorMessage}: ${data.detail}` : errorMessage
        );
      }

      setStatus("success");
      setFeedback(data.message ?? "Reporte enviado correctamente");
    } catch (error) {
      setStatus("error");
      setFeedback(
        error instanceof Error ? error.message : "Error al enviar el reporte"
      );
    }
  };


  const handleToggle = async (task: Task) => {
    setIsLoading(true);

    try {
      const updatedTask = await updateTask({
        ...task,
        completed: !task.completed,
      });
      const nuevasTareas = tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t));
      setTasks(nuevasTareas);
      setTitle("");

      const accion = !task.completed
        ? `Tarea completada: "${task.title}"`
        : `Tarea seleccionada como pendiente: "${task.title}"`;
      await handleEnviarReporte(accion, nuevasTareas);
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
      const nuevasTareas = tasks.filter((t) => t.id !== deletedTask.id);
      setTasks(nuevasTareas);
      setTitle("");

      await handleEnviarReporte(`Tarea eliminada: "${task.title}"`, nuevasTareas);
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
        <Button type="submit" disabled={title.length < 2 && status === "loading"}>
          Agregar
        </Button>
        <br />        
      </form>
      {feedback && <p id="feedback" role="status">{feedback}</p>}
      <div className="Resumen-tareas">
        <div className="resumen-card total">
          <p>Total tareas</p>
          <h4>{tasks.length}</h4>
        </div>
        <div className="resumen-card completadas">
          <p>Tareas completadas</p>
          <h4>{tasks.filter((task) => task.completed).length}</h4>
        </div>
        <div className="resumen-card pendientes">
          <p>Tareas Pendientes</p>
          <h4>{tasks.filter((task) => !task.completed).length}</h4>
        </div> 
        <div className="envio-reporte">
          <button
            type="button"
            className="button-envio-reporte"
            onClick={() => void handleEnviarReporte("Reporte general de tareas solicitado", tasks)}
            disabled={status === "loading"}
          >
            {status === "loading" ? "Enviando reporte..." : "Envío de reporte"}
          </button>
        </div>
        </div>

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
                  {task.completed ? "Marcar como pendiente" : "Completada"}
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


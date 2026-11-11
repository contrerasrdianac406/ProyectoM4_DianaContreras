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
  // Estados de alertas independientes: alta de tarea y envio de reporte
  const [taskStatus, setTaskStatus] = useState<FormStatus>("idle");
  const [taskFeedback, setTaskFeedback] = useState("");
  const [reportStatus, setReportStatus] = useState<FormStatus>("idle");
  const [reportFeedback, setReportFeedback] = useState("");
  // Estados para mostrar los mensajes de validacion de cada campo
  const [titleTouched, setTitleTouched] = useState(false);
  const [descriptionTouched, setDescriptionTouched] = useState(false);


  useEffect(() => {

    const loadTasks = async () => {
      try{
        const  data = await getTasks(user?.uid ?? "");
        const sortedData = [...data].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setTasks (sortedData);
      } catch(err){
        setError("Error al cargar las tareas");
      } finally {
        setIsLoading(false);
      }
    };
    loadTasks();
    
  }, []);

  // Oculta automaticamente la alerta de la tarea 4 segundos despues del resultado
  useEffect(() => {
    if (!taskFeedback) return;
    if (taskStatus !== "success" && taskStatus !== "error") return;

    const timer = setTimeout(() => setTaskFeedback(""), 4000);

    return () => clearTimeout(timer);
  }, [taskStatus, taskFeedback]);

  // Oculta automaticamente la alerta del reporte 4 segundos despues del resultado
  useEffect(() => {
    if (!reportFeedback) return;
    if (reportStatus !== "success" && reportStatus !== "error") return;

    const timer = setTimeout(() => setReportFeedback(""), 4000);

    return () => clearTimeout(timer);
  }, [reportStatus, reportFeedback]);

  // Validacion: minimo 2 caracteres sin contar espacios
  const isTitleValid = title.trim().length >= 2;
  const isDescriptionValid = description.trim().length >= 2;
  const isFormValid = isTitleValid && isDescriptionValid;

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();

    if (!isFormValid) {
      setTitleTouched(true);
      setDescriptionTouched(true);
      return;
    }

    //setIsLoading(true);
      setTaskStatus("loading");
      setTaskFeedback("Enviando mensaje...");
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
            setTaskStatus("success");
            setTaskFeedback(data1.message ?? "Mensaje enviado correctamente");

      setTasks([newTask, ...tasks]);
      setTitle("");
    setDescription("");
      setTitleTouched(false);
      setDescriptionTouched(false);
    } catch (error) {
      setError("Error al crear la tarea");
      setTaskStatus("error");
      setTaskFeedback(
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
    setReportStatus("loading");
    setReportFeedback("Enviando reporte por correo...");

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

      setReportStatus("success");
      setReportFeedback(data.message ?? "Reporte enviado correctamente");
    } catch (error) {
      setReportStatus("error");
      setReportFeedback(
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

  // Tareas ordenadas cronológicamente: de la más reciente a la más antigua
  const sortedTasks = [...tasks].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

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
          onChange={(e) => {
            setTitle(e.target.value);
            setTitleTouched(true);
          }}
          onBlur={() => setTitleTouched(true)}
          placeholder="Escribí una tarea"
          aria-invalid={titleTouched && !isTitleValid}
          aria-describedby={titleTouched && !isTitleValid ? "task-title-error" : undefined}
          />
        {titleTouched && !isTitleValid && (
          <p id="task-title-error" className="task-field-error" role="alert">
            El título debe tener al menos 2 caracteres.
          </p>
        )}
        <br/>
        <label htmlFor="task-description">Descripción:</label>
          <input
          id="task-description"
          type="text"
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            setDescriptionTouched(true);
          }}
          onBlur={() => setDescriptionTouched(true)}
          placeholder="Escribí una descripción"
          aria-invalid={descriptionTouched && !isDescriptionValid}
          aria-describedby={
            descriptionTouched && !isDescriptionValid ? "task-description-error" : undefined
          }
          />
        {descriptionTouched && !isDescriptionValid && (
          <p id="task-description-error" className="task-field-error" role="alert">
            La descripción debe tener al menos 2 caracteres.
          </p>
        )}
        <br/>
        {/* El boton se habilita solo cuando ambos campos tienen al menos 2 caracteres */}
        <Button type="submit" disabled={!isFormValid}>
          Agregar
        </Button>
        <br />        
      </form>
      {taskFeedback && <p id="feedback" role="status">{taskFeedback}</p>}
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
            disabled={reportStatus === "loading"}
          >
            {reportStatus === "loading" ? "Enviando reporte..." : "Envío de reporte"}
          </button>
          {reportFeedback && <p id="report-feedback" role="status">{reportFeedback}</p>}
        </div>
        </div>

      {sortedTasks.length !== 0 ? (
        sortedTasks.map((task, i) => (
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


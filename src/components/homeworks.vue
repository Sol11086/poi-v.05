<template>
    <div>
        <div class="bg-[#04293C] text-[#b1a7d3] flex items-center justify-between h-16 px-5 mb-4">
            <span class="text-xl font-bold">
                <i class="pi pi-inbox mr-2"></i>
                Tareas
            </span>
            <Button label="Crear nueva tarea" size="small" @click="openNewTaskDialog"
                class="bg-transparent text-sm text-[#9F86F9] border-[#9F86F9] border-2 p-2 rounded-full hover:bg-[#9F86F9] hover:text-white transition-colors duration-200" />

        </div>

        <div class="px-5 mb-6">
            <label for="viewTeamTasks" class="block text-sm font-medium text-[#b1a7d3] mb-1">Ver tareas del
                equipo:</label>
            <Dropdown id="viewTeamTasks" v-model="selectedTeamId" :options="allUserTeams" optionLabel="team_name"
                optionValue="id" placeholder="Selecciona Equipo(s)"
                class="w-full md:w-1/2 bg-[#081e29] border-gray-600 p-2  text-white" :pt="{
                    input: { class: 'bg-[#081e29] text-white p-2' },
                    item: ({ props, state, context }) => ({
                        class: context.selected ? 'bg-[#9F86F9] p-2 text-white' : 'bg-[#081e29] text-gray-300 hover:bg-[#06141b]'
                    }),
                    panel: { class: 'bg-[#081e29] p-2 border-gray-600' },
                    header: { class: 'bg-[#081e29] text-white p-2' },
                    filterInput: { class: 'bg-[#06141b] text-white' }
                }" />
        </div>

        <div class="px-5 space-y-4">
            <div v-if="selectedTeamId && tasksForSelectedTeam.length > 0">
                <Panel v-for="t in tasksForSelectedTeam" :key="t.id" toggleable
                    class="mb-4 bg-[#121C22] border border-gray-700 rounded-lg" :pt="{
                        header: (options) => ({
                            class: [
                                'flex items-center justify-between',
                                'p-4',
                                'border-b border-gray-700',
                                'text-white',
                                'bg-[#04293c] rounded-t-lg',
                                'cursor-pointer'
                            ]
                        }),
                        content: { class: 'p-4 text-gray-300 bg-[#121C22] rounded-b-lg' },
                        toggler: { class: 'text-white hover:text-[#9F86F9]' }
                    }">
                    <template #header>
                        <div class="flex-grow">
                            <span class="text-xl font-bold text-white">{{ t.title }}</span>
                        </div>
                    </template>


                    <template #icons>
                        <div class="flex  items-center space-x-3">
                            <span class="text-xs text-gray-400 italic">
                                {{ t.due_date ? `Vence: ${new Date(t.due_date).toLocaleDateString()}` : 'Sin fecha límite' }}
                            </span>
                            <Tag :value="t.status.toUpperCase()" :severity="getStatusSeverity(t.status)"
                                class="p-1 text-xs text-[#9f86f9]"></Tag>
                            <Button v-if="t.is_creator" icon="pi pi-trash" severity="danger" text rounded
                                aria-label="Eliminar" @click.stop="confirmDeleteTask(t)"
                                class="text-red-500 hover:bg-red-700 hover:text-white" />
                        </div>

                    </template>


                    <p class="font-semibold text-gray-100 mt-2">Descripción:</p>
                    <p class="text-gray-300 mt-1 whitespace-pre-line">{{ t.description || 'No hay descripción.' }}</p>

                    <div v-if="t.has_reward" class="mt-3">
                        <p class="text-gray-300">
                            Recompensa:
                            <i class="pi pi-spin pi-star-fill ml-2" style="font-size: 1.5rem; color: yellowgreen;"></i>
                        </p>
                    </div>
                    <p class="text-xs text-gray-500 mt-3">Creado por: {{ t.creator_username }} el {{ new
                        Date(t.created_at).toLocaleDateString() }}</p>


                    <template #footer>
                        <div
                            class="flex flex-col text-[#9F86F9] sm:flex-row justify-between items-center gap-3 pt-3 border-t border-gray-700 m-3">
                            <CloudinaryUploadButton buttonLabel="Seleccionar Archivo para Tarea"
                                :uploadPreset="taskUploadPreset" :folder="getTaskSubmissionFolder(t)"
                                :tags="['task_submission', `task-${t.id}`]" source="task_submission" :relatedId="t.id"
                                @upload-success="(fileData) => handleTaskFileUploaded(fileData, t)" @upload-error="handleTaskUploadError" />
                            <div v-if="uploadedTaskFileInfo && currentTaskForFileUpload === t.id"
                                class="mt-2 text-sm text-white"> Archivo seleccionado: {{
                                uploadedTaskFileInfo.original_filename }} ({{
                                    (uploadedTaskFileInfo.bytes / 1024).toFixed(2) }} KB)
                            </div>
                            <div class="flex gap-3">
                                <Button v-if="t.is_creator" label="Ver Entregas" icon="pi pi-users"
                                    @click.stop="viewSubmissions(t)"
                                    class="bg-transparent text-sm text-blue-400 border-blue-400 border-2 p-2 rounded-full hover:bg-blue-400 hover:text-white h-10" />
                                <Button
                                    v-if="!t.is_creator && !t.completed_by_current_user && t.status !== 'completed' && t.status !== 'overdue'"
                                    label="Entregar Tarea" @click.stop="promptSubmitTask(t)"
                                    class="bg-transparent text-sm text-[#9F86F9] border-[#9F86F9] border-2 p-2 rounded-full hover:bg-[#9F86F9] hover:text-white h-10" />
                                <Tag v-if="!t.is_creator && t.completed_by_current_user" value="ENTREGADA"
                                    severity="success" icon="pi pi-check" class="h-10 flex items-center"></Tag>
                                <Tag v-if="t.status === 'overdue' && !t.completed_by_current_user && !t.is_creator"
                                    value="VENCIDA" severity="danger" class="h-10 flex items-center"></Tag>
                            </div>
                        </div>
                    </template>
                </Panel>
            </div>
            <div v-else-if="selectedTeamId" class="text-center text-gray-400 py-8">
                <i class="pi pi-cloud-upload text-4xl mb-2"></i>
                <p>No hay tareas para este equipo.</p>
                <p class="text-sm">Puedes crear una usando el botón "Crear nueva tarea".</p>
            </div>
            <div v-else class="text-center text-gray-400 py-8">
                <i class="pi pi-search text-4xl mb-2"></i>
                <p>Por favor, selecciona un equipo para ver sus tareas.</p>
            </div>
        </div>

        <Dialog v-model:visible="taskDialogVisible" modal
            class="w-full max-w-lg h-fit p-0 border border-gray-700 rounded-lg" :style="{ backgroundColor: '#04293C' }"
            :pt="{
                root: { class: 'bg-[#04293C] rounded-lg shadow-xl' },
                header: { class: 'bg-[#081e29] p-3 text-white text-xl flex items-center justify-between rounded-t-lg' },
                content: { class: 'p-5 text-gray-300' },
                footer: { class: 'p-3 bg-[#081e29] flex justify-end rounded-b-lg' }
            }">
            <template #header>
                <span class="p-2 text-white text-xl">
                    <i class="pi pi-inbox mr-2"></i>
                    Nueva tarea
                </span>
            </template>

            <div class="p-2">
                <span class="text-gray-300">Describe tu tarea</span>
            </div>
            <div class="p-2 grid w-full mt-1 gap-6">
                <FloatLabel>
                    <InputText id="taskTitle" class="bg-[#081e29] p-2 text-white w-full focus:border-[#9F86F9]"
                        size="large" v-model="task.title" :invalid="submitted && !task.title" />
                    <label for="taskTitle" class="text-gray-400">Título de la tarea <span
                            class="text-red-500">*</span></label>
                </FloatLabel>

                <FloatLabel>
                    <Textarea id="taskDescription" v-model="task.description"
                        class="bg-[#081e29] p-2 text-white w-full focus:border-[#9F86F9]" rows="4"
                        style="resize: none" />
                    <label for="taskDescription" class="text-gray-400">Descripción</label>
                </FloatLabel>

                <FloatLabel>
                    <Dropdown id="taskTeam" v-model="task.team_id" :options="manageableTeams" optionLabel="team_name"
                        optionValue="id" class="w-full text-white" :invalid="submitted && !task.team_id" :pt="{
                            root: { class: 'bg-[#081e29] border-gray-600' },
                            input: { class: (task.team_id ? 'text-white' : 'text-gray-400') + ' p-2 bg-[#081e29]' }, // Estilo para el input/label
                            item: ({ props, state, context }) => ({
                                class: context.selected ? 'bg-[#9F86F9] text-white' : 'bg-[#081e29] text-gray-300 hover:bg-[#06141b]'
                            }),
                            panel: { class: 'bg-[#081e29] border-gray-600' },
                            header: { class: 'bg-[#081e29] text-gray-300 p-2' },
                            dropdownIcon: { class: 'text-white' }
                        }">
                        <template #dropdownicon>
                            <i class="pi pi-users text-gray-400" />
                        </template>
                    </Dropdown>
                    <label for="taskTeam" class="text-gray-400">Asignar a equipo <span
                            class="text-red-500">*</span></label>
                    <small class="p-error" v-if="submitted && !task.team_id"> Seleccione un Equipo.
                    </small>
                </FloatLabel>

                <FloatLabel>
                    <Calendar id="taskDueDate" v-model="task.due_date" dateFormat="yy-mm-dd" showTime hourFormat="24"
                        class="w-full" :pt="{
                            input: { class: 'bg-[#081e29] p-2 text-white w-full focus:border-[#9F86F9]' },
                            panel: { class: 'bg-[#081e29] border-gray-700' },
                            header: { class: 'bg-[#0d2a3a] text-white' },
                            timePicker: { class: 'bg-[#0d2a3a] text-white' }
                        }" />
                    <label for="taskDueDate" class=" text-gray-400">Fecha de Entrega</label>
                </FloatLabel>


                <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8 mt-2">
                    <div class="flex items-center gap-2">
                        <Checkbox v-model="task.has_reward" inputId="hw-rewards" :binary="true" />
                        <label for="hw-rewards" class="text-gray-300 text-sm">Crear tarea con recompensa</label>
                    </div>
                    <div class="flex items-center gap-2">
                        <Checkbox v-model="task.notify_by_email" inputId="email-advice" :binary="true" />
                        <label for="email-advice" class="text-gray-300 text-sm">Enviar aviso por email</label>
                    </div>
                </div>
            </div>
            <template #footer>
                <div class="flex justify-end space-x-2 p-3">
                    <Button label="Cancelar" icon="pi pi-times" @click="hideDialog"
                        class="bg-transparent text-sm text-gray-400 border-gray-400 border-2 p-2 rounded-full hover:bg-gray-600 hover:text-white transition-colors duration-200" />
                    <Button label="Crear Tarea" icon="pi pi-check" @click="saveTask"
                        class="bg-transparent text-sm text-[#9F86F9] border-[#9F86F9] border-2 p-2 rounded-full hover:bg-[#9F86F9] hover:text-white transition-colors duration-200" />
                </div>
            </template>
        </Dialog>

        <Dialog v-model:visible="submissionsDialogVisible" modal header="Entregas de la Tarea" class="w-full max-w-xl"
            :pt="{
                root: { class: 'bg-[#04293C] rounded-lg shadow-xl border border-gray-700' },
                header: { class: 'bg-[#081e29] p-4 text-white text-xl flex items-center justify-between rounded-t-lg' },
                content: { class: 'p-5 text-gray-300' },
                footer: { class: 'p-4 bg-[#081e29] flex justify-end rounded-b-lg' }
            }">
            <DataTable :value="currentTaskSubmissions" responsiveLayout="scroll" paginator :rows="5"
                emptyMessage="Nadie ha entregado esta tarea aún." :pt="{
                    wrapper: { class: 'border border-gray-700 rounded-md' },
                    thead: { class: 'bg-[#0d2a3a] text-gray-300' },
                    tbody: { class: 'text-gray-300' },
                    emptyMessage: { cell: { class: 'p-4 text-center' } }
                }">
                <Column field="username" header="Usuario" sortable></Column>
                <Column field="submitted_at" header="Fecha de Entrega" sortable>
                    <template #body="slotProps">
                        {{ new Date(slotProps.data.submitted_at).toLocaleString() }}
                    </template>
                </Column>
                <Column field="notes" header="Notas">
                    <template #body="slotProps">
                        {{ slotProps.data.notes || '-' }}
                    </template>
                </Column>
            </DataTable>
            <template #footer>
                <Button label="Cerrar" icon="pi pi-times" @click="submissionsDialogVisible = false"
                    class="bg-transparent text-sm text-gray-400 border-gray-400 border-2 p-2 rounded-full hover:bg-gray-600 hover:text-white transition-colors duration-200" />
            </template>
        </Dialog>

        <Dialog v-model:visible="submitTaskDialogVisible" header="Confirmar Entrega" :modal="true"
            class="w-full max-w-md" :pt="{
                root: { class: 'bg-[#04293C] rounded-lg shadow-xl border border-gray-700' },
                header: { class: 'bg-[#081e29] p-4 text-white text-xl flex items-center justify-between rounded-t-lg' },
                content: { class: 'p-5 text-gray-300' },
                footer: { class: 'p-4 bg-[#081e29] flex justify-end space-x-2 rounded-b-lg' }
            }">
            <div class="field mb-4">
                <label for="submissionNotes" class="block text-sm font-medium text-gray-300 mb-1">Notas Adicionales
                    (Opcional):</label>
                <Textarea id="submissionNotes" v-model="submissionNotes" rows="3"
                    class="w-full bg-[#081e29] p-2 text-white focus:border-[#9F86F9]" style="resize: none" />
            </div>
            <template #footer>
                <Button label="Cancelar" icon="pi pi-times" @click="submitTaskDialogVisible = false"
                    class="bg-transparent text-sm text-gray-400 border-gray-400 border-2 p-2 rounded-full hover:bg-gray-600 hover:text-white transition-colors duration-200" />
                <Button label="Confirmar Entrega" icon="pi pi-check" @click="executeSubmitTask"
                    class="bg-transparent text-sm text-[#9F86F9] border-[#9F86F9] border-2 p-2 rounded-full hover:bg-[#9F86F9] hover:text-white transition-colors duration-200" />
            </template>
        </Dialog>

    </div>
</template>
<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import CloudinaryUploadButton from '@/components/CloudinaryUploadButton.vue';
import axios from 'axios';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Dropdown from 'primevue/dropdown';
import Calendar from 'primevue/calendar';
import Checkbox from 'primevue/checkbox';
import Tag from 'primevue/tag';
import Panel from 'primevue/panel';
import FileUpload from 'primevue/fileupload';
import FloatLabel from 'primevue/floatlabel';
import MultiSelect from 'primevue/multiselect';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import { parseJwt } from '@/utils/jwt';
// import { useConfirm } from "primevue/useconfirm";
// import { useToast } from "primevue/usetoast";

// const confirm = useConfirm();
// const toast = useToast();

const taskDialogVisible = ref(false);
const submissionsDialogVisible = ref(false);
const submitTaskDialogVisible = ref(false);

// ==============================================
const props = defineProps({
    currentTask: Object, // La tarea actual para la que se está haciendo la entrega
});
const taskUploadPreset = 'vue_task_uploads'; // Ya lo tienes
const uploadedTaskFileInfo = ref(null);
const submissionNotes = ref(''); // Ya lo tienes, pero se usará en el diálogo de entrega

const currentTaskForFileUpload = ref(null); // Nuevo: para saber a qué tarea pertenece uploadedTaskFileInfo

// Nueva función para el folder dinámico
const getTaskSubmissionFolder = (taskItem) => {
  return taskItem ? `tasks/${taskItem.id}/submissions` : 'tasks/submissions/general';
};

const handleTaskFileUploaded = (fileData, taskItem) => { // Modificado para aceptar taskItem
  console.log(`Archivo subido para la tarea ${taskItem?.id || 'desconocida'}:`, fileData);
  uploadedTaskFileInfo.value = fileData;
  currentTaskForFileUpload.value = taskItem?.id; // Asocia el archivo con el ID de esta tarea
};

const handleTaskUploadError = (error) => {
  console.error("Error en la subida del archivo de tarea:", error);
  alert(`Error al subir archivo: ${error.message || 'Error desconocido'}`);
  uploadedTaskFileInfo.value = null;
  currentTaskForFileUpload.value = null;
};

// Ref para el diálogo de entrega y la tarea que se está entregando
const taskToSubmitForDialog = ref(null); // Almacenará { task: Object, fileInfo: Object, notes: String }

const promptSubmitTask = (taskItem) => {
  taskToSubmitForDialog.value = {
    task: taskItem,
    // Captura el archivo que se asoció con esta tarea específica,
    // o el último archivo subido si coincide con la tarea actual.
    fileInfo: (currentTaskForFileUpload.value === taskItem.id) ? uploadedTaskFileInfo.value : null,
    notes: '' // Inicializa las notas para el diálogo
  };
  submitTaskDialogVisible.value = true;
};

// En el Dialog para la entrega (submitTaskDialogVisible):
// Asegúrate que el v-model para las notas sea: v-model="taskToSubmitForDialog.notes"
// <Textarea id="submissionNotes" v-model="taskToSubmitForDialog.notes" ... />

const executeSubmitTask = async () => {
  if (!taskToSubmitForDialog.value || !taskToSubmitForDialog.value.task) return;

  const token = getToken(); // Asegúrate que getToken() esté funcionando y currentUserId.value se popule
  if (!token) {
      alert("Error de autenticación. Por favor, inicia sesión de nuevo.");
      return;
  }

  const payload = {
    notes: taskToSubmitForDialog.value.notes,
    file_info: taskToSubmitForDialog.value.fileInfo // Puede ser null si no se seleccionó archivo para esta tarea
  };

  try {
    const response = await axios.post(`/api/tasks/${taskToSubmitForDialog.value.task.id}/submit`, payload, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.data.success) {
      alert("¡Tarea entregada exitosamente!");
      fetchTasksForTeam(taskToSubmitForDialog.value.task.team_id); // Refrescar la lista de tareas
      submitTaskDialogVisible.value = false;
      
      // Limpiar solo si el archivo entregado era el que estaba en uploadedTaskFileInfo
      if (taskToSubmitForDialog.value.fileInfo && uploadedTaskFileInfo.value && taskToSubmitForDialog.value.fileInfo.public_id === uploadedTaskFileInfo.value.public_id) {
          uploadedTaskFileInfo.value = null;
          currentTaskForFileUpload.value = null;
      }
      taskToSubmitForDialog.value = null; // Resetear la tarea para el diálogo
    } else {
      alert(`Error al entregar la tarea: ${response.data.error}`);
    }
  } catch (error) {
    console.error("Error submitting task:", error.response ? error.response.data : error.message);
    alert(`Error del servidor al entregar la tarea: ${error.response?.data?.error || error.message}`);
  }
};
// ==============================================

const initialTaskState = () => ({
    title: '',
    description: '',
    team_id: null, // Cambiado para MultiSelect
    due_date: null,
    has_reward: false,
    notify_by_email: false
});
const task = ref(initialTaskState());
const taskToSubmitForNotes = ref(null);

const submitted = ref(false);
const manageableTeams = ref([]);
const tasksForSelectedTeam = ref([]);
const currentTaskSubmissions = ref([]);
const allUserTeams = ref([]);
const selectedTeamId = ref(null); // Este será el ID del equipo cuyas tareas se muestran

// Debes obtener el ID del usuario actual de alguna manera (ej. store, auth service)
const currentUserId = ref(null); // Ejemplo: 'VEK15' - ¡REEMPLAZAR CON LÓGICA REAL!

const getToken = () => {
    const token = localStorage.getItem('user_token');
    if (token && !currentUserId.value) {
        // Decodificar token para obtener userId si aún no lo tienes
        try {
            const decoded = parseJwt(token); // Asegúrate que parseJwt esté disponible
            currentUserId.value = decoded.id;
        } catch (e) {
            console.error("Error decodificando token:", e);
        }
    }
    return token;
};


const fetchManageableTeams = async () => {
    try {
        const token = getToken();
        const response = await axios.get('/api/manageable-teams', {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Response from /api/manageable-teams:', response.data); // <--- AÑADE ESTO
        if (response.data.success) {
            manageableTeams.value = response.data.teams;
            console.log('Manageable Teams set:', manageableTeams.value);
        }
    } catch (error) {
        console.error("Error fetching manageable teams:", error);
        // toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los equipos para asignar tareas.', life: 3000 });
    }
};

const fetchAllUserTeams = async () => {
    try {
        const token = getToken();
        const response = await axios.get('/api/my-teams', {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Response from /api/my-teams:', response.data);
        if (response.data.success) {
            console.log('All User Teams set:', allUserTeams.value);
            allUserTeams.value = response.data.teams;
            if (allUserTeams.value.length > 0 && !selectedTeamId.value) {
                selectedTeamId.value = allUserTeams.value[0].id;
            }
        }
    } catch (error) {
        console.error("Error fetching all user teams:", error);
        // toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar tus equipos.', life: 3000 });
    }
};

const fetchTasksForTeam = async (teamId) => {
    if (!teamId) {
        tasksForSelectedTeam.value = [];
        return;
    }
    try {
        const token = getToken();
        // Asegurarse que currentUserId.value esté disponible antes de esta llamada si es necesario para el backend
        if (!currentUserId.value && token) { // Volver a intentar obtener userId si es necesario
            const decoded = parseJwt(token);
            if (decoded) currentUserId.value = decoded.id;
        }
        if (!currentUserId.value) {
            console.warn("User ID no disponible para fetchTasksForTeam");
            // Podrías mostrar un error o esperar a que el ID esté disponible
            // return;
        }

        const response = await axios.get(`/api/teams/${teamId}/tasks`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.success) {
            // El backend ya añade is_creator y completed_by_current_user
            tasksForSelectedTeam.value = response.data.tasks;
        } else {
            tasksForSelectedTeam.value = [];
        }
    } catch (error) {
        console.error(`Error fetching tasks for team ${teamId}:`, error);
        tasksForSelectedTeam.value = [];
        // toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar las tareas.', life: 3000 });
    }
};

onMounted(async () => {
    getToken(); // Para inicializar currentUserId.value
    await fetchManageableTeams();
    await fetchAllUserTeams(); // Esto podría auto-seleccionar un equipo y disparar el watch
});

watch(selectedTeamId, (newTeamId) => {
    if (newTeamId) {
        fetchTasksForTeam(newTeamId);
    } else {
        tasksForSelectedTeam.value = [];
    }
});

const openNewTaskDialog = () => {
    task.value = initialTaskState();
    if (selectedTeamId.value) { // Pre-seleccionar el equipo actual si es relevante
        // task.value.team_ids = [selectedTeamId.value]; // Descomentar si se quiere preseleccionar
    }
    submitted.value = false;
    taskDialogVisible.value = true;
};

const hideDialog = () => {
    taskDialogVisible.value = false;
    submitted.value = false;
};

const saveTask = async () => {
    submitted.value = true;
    if (!task.value.title || !task.value.team_id) {
        console.warn('Título y equipo son obligatorios.');
        // toast.add({ severity: 'warn', summary: 'Atención', detail: 'Título y equipo son obligatorios.', life: 3000 });
        return;
    }

    try {
        const token = getToken();
        const payload = { ...task.value };
        if (payload.due_date) {
            payload.due_date = new Date(payload.due_date).toISOString();
        }
        const effectivePayload = {
            ...payload,
            team_id: payload.team_id // Envía solo el primer equipo seleccionado
        };


        console.log("Enviando tarea:", effectivePayload);

        const response = await axios.post('/api/tasks', effectivePayload, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
            // toast.add({ severity: 'success', summary: 'Éxito', detail: 'Tarea guardada.', life: 3000 });
            console.log('Tarea guardada');
            taskDialogVisible.value = false;
            // Recargar tareas del equipo afectado (o de todos los afectados si el backend lo soporta)
            if (selectedTeamId.value === effectivePayload.team_id) {
                fetchTasksForTeam(selectedTeamId.value);
            } else {
                // Si se creó para un equipo diferente al visualizado, se podría recargar ese también
                // o simplemente recargar el actual si la nueva tarea no debería aparecer aquí.
                fetchTasksForTeam(selectedTeamId.value); // Recarga el equipo actual
            }
        } else {
            // toast.add({ severity: 'error', summary: 'Error', detail: response.data.error || 'No se pudo guardar la tarea.', life: 3000 });
            console.error('Error guardando tarea:', response.data.error);
        }
    } catch (error) {
        console.error("Error saving task:", error);
        const errorMsg = error.response?.data?.error || 'Ocurrió un error al guardar.';
        // toast.add({ severity: 'error', summary: 'Error del Servidor', detail: errorMsg, life: 3000 });
        console.error('Error del servidor:', errorMsg);
    }
};

const confirmDeleteTask = (taskToDelete) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar la tarea "${taskToDelete.title}"?`)) {
        deleteTask(taskToDelete);
    }
};

const deleteTask = async (taskToDelete) => {
    try {
        const token = getToken();
        await axios.delete(`/api/tasks/${taskToDelete.id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        // toast.add({ severity: 'success', summary: 'Éxito', detail: 'Tarea eliminada.', life: 3000 });
        console.log('Tarea eliminada');
        fetchTasksForTeam(taskToDelete.team_id); // Recargar
    } catch (error) {
        console.error("Error deleting task:", error);
        // toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar la tarea.', life: 3000 });
    }
};

// const promptSubmitTask = (taskItem) => {
//     taskToSubmitForNotes.value = taskItem;
//     submissionNotes.value = '';
//     submitTaskDialogVisible.value = true;
// };

// const executeSubmitTask = async () => {
//     if (!taskToSubmitForNotes.value) return;
//     try {
//         const token = getToken();
//         const response = await axios.post(`/api/tasks/${taskToSubmitForNotes.value.id}/submit`, {
//             notes: submissionNotes.value
//         }, {
//             headers: { Authorization: `Bearer ${token}` }
//         });
//         if (response.data.success) {
//             // toast.add({ severity: 'success', summary: 'Éxito', detail: 'Tarea marcada como entregada.', life: 3000 });
//             console.log('Tarea entregada');
//             fetchTasksForTeam(taskToSubmitForNotes.value.team_id);
//             submitTaskDialogVisible.value = false;
//         } else {
//             // toast.add({ severity: 'error', summary: 'Error', detail: response.data.error || 'No se pudo entregar la tarea.', life: 3000 });
//             console.error('Error entregando tarea:', response.data.error);
//         }
//     } catch (error) {
//         console.error("Error submitting task:", error);
//         const errorMsg = error.response?.data?.error || 'Ocurrió un error al entregar la tarea.';
//         // toast.add({ severity: 'error', summary: 'Error', detail: errorMsg, life: 3000 });
//         console.error('Error del servidor:', errorMsg);
//     }
// };


const viewSubmissions = async (taskToView) => {
    try {
        const token = getToken();
        const response = await axios.get(`/api/tasks/${taskToView.id}/submissions`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.success) {
            currentTaskSubmissions.value = response.data.submissions;
            submissionsDialogVisible.value = true;
        } else {
            // toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar las entregas.', life: 3000 });
            console.error('Error cargando entregas:', response.data.error);
        }
    } catch (error) {
        console.error("Error fetching submissions:", error);
        // toast.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar entregas.', life: 3000 });
    }
};

const getTeamName = (teamId) => {
    const team = allUserTeams.value.find(t => t.id === teamId) || manageableTeams.value.find(t => t.id === teamId);
    return team ? team.team_name : 'Equipo Desconocido';
};

const getStatusSeverity = (status) => {
    switch (status?.toLowerCase()) {
        case 'completed': return 'success';
        case 'in_progress': return 'info';
        case 'overdue': return 'danger';
        case 'pending':
        default: return 'warning';
    }
};

const onTaskFileUpload = (event) => {
    // Manejar la respuesta de la subida de archivo, por ejemplo, mostrar un toast.
    // toast.add({severity: 'info', summary: 'Success', detail: 'File Uploaded', life: 3000});
    console.log('Archivo subido (simulado):', event.files);
    // Podrías querer refrescar la tarea o añadir el archivo a una lista en la UI.
};

</script>

<style scoped>
:deep(.p-panel-header-actions) {
    display: flex;
    flex-direction: row;
}
</style>

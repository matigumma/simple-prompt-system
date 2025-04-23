import { useState, useEffect, useCallback } from 'react';
import { Prompt } from '@/app/(features)/prompt-editor/types'; // Import from editor types

// --- Constants and Local Storage Logic ---
const DEFAULT_PROMPTS: Prompt[] = [
    {
        id: "ad-hoc",
        name: "Nivel 1: Directo",
        description: `- Prompts rápidos en lenguaje natural para prototipado ágil
- Perfecto para explorar capacidades y comportamientos del modelo
- Se pueden ejecutar en múltiples modelos para comparación
- Ideal para tareas puntuales y experimentación`,
        content: `Resume el contenido con 3 opiniones a favor del autor y 3 opiniones en contra del autor

...pega el contenido aquí...`,
        isJsonOutput: false,
        variables: [],
        llmId: "gpt-4.1-mini",
        instructions: ""
    },
    {
        id: "structured",
        name: "Nivel 2: Estructurado",
        description: `- Prompts reutilizables con propósito e instrucciones claras
- Usa formato XML/estructurado para mejor rendimiento del modelo
- Contiene variables estáticas que se pueden modificar
- Resuelve problemas bien definidos y repetibles
- Prompting sin ejemplos (zero-shot) suele ser eficaz con reasoning models`,
        content: `<proposito>
    Resume el contenido dado según las instrucciones y el ejemplo de salida
</proposito>

<instrucciones>
   <instruccion>Salida en formato markdown</instruccion>
   <instruccion>Resume en 4 secciones: Resumen general, Puntos principales, Sentimiento, y 3 opiniones a favor del autor y 3 opiniones en contra del autor</instruccion>
   <instruccion>Escribe el resumen en el mismo formato que el ejemplo de salida</instruccion>
</instrucciones>

<contenido>
    {...} <<< actualiza esto manualmente
</contenido>`,
        isJsonOutput: false,
        variables: [],
        llmId: "o3-mini",
        instructions: ""
    },
    {
        id: "few-shot",
        name: "Nivel 3: Estructurado con ejemplos",
        description: `- Se basa en el Nivel 2 añadiendo ejemplos de salida (few-shot)
- Los ejemplos guían al modelo para producir formatos específicos
- Aumenta la consistencia y confiabilidad de las salidas
- Perfecto cuando el formato de salida es importante`,
        content: `<proposito>
    Resume el contenido dado según las instrucciones y el ejemplo de salida
</proposito>

<instrucciones>
   <instruccion>Salida en formato markdown</instruccion>
   <instruccion>Resume en 4 secciones: Resumen general, Puntos principales, Sentimiento, y 3 opiniones a favor del autor y 3 opiniones en contra del autor</instruccion>
   <instruccion>Escribe el resumen en el mismo formato que el ejemplo de salida</instruccion>
</instrucciones>

<ejemplo-salida>

    # Título

    ## Resumen General
    ...

    ## Puntos Principales
    ...

    ## Sentimiento
    ...

    ## Opiniones (a favor del autor)
    ...

    ## Opiniones (en contra del autor)
    ...
</ejemplo-salida>

<contenido>
    {...} <<< actualiza esto manualmente
</contenido>`,
        isJsonOutput: false,
        variables: [],
        llmId: "gpt-4.1-mini",
        instructions: ""
    },
    {
        id: "dynamic-vars",
        name: "Nivel 4: Variables dinamicas",
        description: `- Prompts listos para producción con variables dinámicas
- Se pueden integrar en código y aplicaciones
- Escalabilidad infinita mediante actualizaciones programáticas
- Base para construir herramientas y agentes potenciados por IA`,
        content: `<proposito>
    Resume el contenido dado según las instrucciones y el ejemplo de salida
</proposito>

<instrucciones>
   <instruccion>Salida en formato markdown</instruccion>
   <instruccion>Resume en 4 secciones: Resumen general, Puntos principales, Sentimiento, y 3 opiniones a favor del autor y 3 opiniones en contra del autor</instruccion>
   <instruccion>Escribe el resumen en el mismo formato que el ejemplo de salida</instruccion>
</instrucciones>

<ejemplo-salida>

    # Título

    ## Resumen General
    ...

    ## Puntos Principales
    ...

    ## Sentimiento
    ...

    ## Opiniones (a favor del autor)
    ...

    ## Opiniones (en contra del autor)
    ...
</ejemplo-salida>

<contenido>
    {{content}}
</contenido>`,
        isJsonOutput: false,
        variables: [{ name: "content", value: "" }],
        llmId: "gpt-4.1-mini",
        instructions: ""
    },
    {
        id: "openai-best-practice",
        name: "OpenAI Best Practice (Identity/Instructions/Examples/Context)",
        description: "",
        content: `# Identidad
Eres un asistente útil que etiqueta reseñas cortas de productos como Positiva, Negativa o Neutral.

# Instrucciones
Solo responde con una sola palabra, sin formato ni comentarios adicionales.
Tu respuesta debe ser únicamente una de las palabras "Positiva", "Negativa" o "Neutral" dependiendo del sentimiento de la reseña de producto que se te proporcione.

# Ejemplos
<product_review id="example-1">
    Me encantan estos auriculares: ¡la calidad de sonido es increíble!
</product_review>
<assistant_response id="example-1">
    Positiva
</assistant_response>

<product_review id="example-2">
    La batería está bien, pero las almohadillas se sienten baratas.
</product_review>
<assistant_response id="example-2">
    Neutral
</assistant_response>

<product_review id="example-3">
    El servicio al cliente es terrible, nunca volveré a comprarles.
</product_review>
<assistant_response id="example-3">
    Negativa
</assistant_response>

# Contexto
<product_review>
{{review}}
</product_review>`,
        isJsonOutput: false,
        variables: [{ name: "review", value: "" }],
        llmId: "gpt-4.1-mini",
        instructions: ""
    },
    {
        id: "chain-of-thought",
        name: "Chain-of-Thought Reasoning",
        description: "",
        content: `Eres un experto en la resolución de problemas. Piensa paso a paso para descomponer el problema y explicar tu razonamiento.

Pregunta: {{question}}

Primero, piensa cuidadosamente paso a paso qué documentos o información se necesitan para responder la consulta. Luego, imprime el TÍTULO y el ID de cada documento. Después, formatea los IDs en una lista.

Respuesta:`,
        isJsonOutput: false,
        variables: [{ name: "question", value: "" }],
        llmId: "o3-mini",
        instructions: ""
    },
    {
        id: "json-output",
        name: "Structured Output (JSON)",
        description: "",
        content: `Resume el siguiente contenido y muestra el resultado como un objeto JSON con los siguientes campos:

"summary": un resumen conciso del contenido
"main_points": un arreglo con los puntos principales
"sentiment": "positive", "neutral" o "negative"
"hot_takes_for": arreglo de 3 opiniones polémicas a favor del autor
"hot_takes_against": arreglo de 3 opiniones polémicas en contra del autor

Contenido:
{{content}}

Responde ÚNICAMENTE con JSON válido.`,
        isJsonOutput: true,
        variables: [{ name: "content", value: "" }],
        llmId: "gpt-4.1-mini",
        instructions: ""
    },
    {
        id: "blank",
        name: "Blank",
        description: "",
        content: "",
        isJsonOutput: false,
        variables: [],
        llmId: "gpt-4.1-mini",
        instructions: ""
    }
];

const LOCAL_STORAGE_KEY = "prompt-training-system.prompts";
const LOCAL_STORAGE_ACTIVE_KEY = "prompt-training-system.activePromptId";

function loadPrompts(): Prompt[] {
    if (typeof window === 'undefined') return DEFAULT_PROMPTS; // Avoid localStorage on server
    try {
        const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (raw) return JSON.parse(raw);
    } catch (e) {
        console.error("Failed to load prompts from localStorage", e);
    }
    return DEFAULT_PROMPTS;
}

function savePrompts(prompts: Prompt[]) {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(prompts));
    } catch (e) {
        console.error("Failed to save prompts to localStorage", e);
    }
}

function loadActivePromptId(): string | null {
    if (typeof window === 'undefined') return null;
    try {
        return localStorage.getItem(LOCAL_STORAGE_ACTIVE_KEY);
    } catch (e) {
        console.error("Failed to load active prompt ID from localStorage", e);
    }
    return null;
}

function saveActivePromptId(id: string) {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(LOCAL_STORAGE_ACTIVE_KEY, id);
    } catch (e) {
        console.error("Failed to save active prompt ID to localStorage", e);
    }
}

function generateId(): string {
    return "prompt-" + Math.random().toString(36).slice(2, 10);
}

// --- Hook ---
export function usePrompts(
    // Dependencies that will likely come from context later
    setSelectedLLM: (id: string) => void,
    setOutput: (output: string) => void, // Added setOutput dependency
    setError: (error: string | undefined) => void, // Added setError dependency
    // Optional initial state (useful if context provides it)
    initialPrompts?: Prompt[],
    initialActivePromptId?: string | null
) {
    const [prompts, setPrompts] = useState<Prompt[]>(initialPrompts || DEFAULT_PROMPTS);
    const [activePromptId, setActivePromptId] = useState<string>(initialActivePromptId || DEFAULT_PROMPTS[0]?.id || "");

    // Load initial state from localStorage on mount (client-side only)
    useEffect(() => {
        const loadedPrompts = loadPrompts();
        setPrompts(loadedPrompts);
        const loadedActive = loadActivePromptId();
        if (loadedActive && loadedPrompts.find(p => p.id === loadedActive)) {
            setActivePromptId(loadedActive);
        } else if (loadedPrompts.length > 0) {
            setActivePromptId(loadedPrompts[0].id);
        } else {
            setActivePromptId(""); // Handle case with no prompts
        }
    }, []);

    // Save prompts to localStorage whenever they change
    useEffect(() => {
        savePrompts(prompts);
    }, [prompts]);

    // Save active prompt ID to localStorage whenever it changes
    useEffect(() => {
        if (activePromptId) { // Only save if there's an active ID
            saveActivePromptId(activePromptId);
        }
    }, [activePromptId]);

    const activePrompt = prompts.find(p => p.id === activePromptId);

    const handleSelectPrompt = useCallback((id: string) => {
        setActivePromptId(id);
        setOutput(""); // Clear output
        setError(undefined); // Clear error
        const prompt = prompts.find(p => p.id === id);
        if (prompt?.llmId) {
            setSelectedLLM(prompt.llmId); // Update shared LLM state
        } else {
            // If the selected prompt doesn't have an llmId, maybe default?
            // Or rely on the existing selectedLLM state? For now, do nothing extra.
        }
    }, [prompts, setSelectedLLM, setOutput, setError]); // Added dependencies

    const handleAddPrompt = useCallback(() => {
        const newPrompt: Prompt = {
            id: generateId(),
            name: "Untitled Prompt",
            content: "",
            isJsonOutput: false,
            variables: []
        };
        setPrompts(prev => [...prev, newPrompt]);
        setActivePromptId(newPrompt.id);
    }, []);

    const handleRenamePrompt = useCallback((id: string, newName: string) => {
        setPrompts(prev => prev.map(p => (p.id === id ? { ...p, name: newName } : p)));
    }, []);

    const handleDeletePrompt = useCallback((id: string) => {
        setPrompts(prev => {
            const idx = prev.findIndex(p => p.id === id);
            if (idx === -1) return prev; // Should not happen if called from UI
            const newPrompts = prev.filter(p => p.id !== id);
            // If the deleted prompt was active, select the next/previous/first one
            if (id === activePromptId) {
                const nextPrompt = newPrompts[idx] || newPrompts[idx - 1] || newPrompts[0];
                setActivePromptId(nextPrompt?.id || ""); // Fallback to empty string if no prompts left
            }
            return newPrompts;
        });
    }, [activePromptId]); // Added activePromptId dependency

    const handleCopyPrompt = useCallback((id: string) => {
        const prompt = prompts.find(p => p.id === id);
        if (prompt && typeof navigator !== 'undefined' && navigator.clipboard) {
            navigator.clipboard.writeText(prompt.content).catch(err => {
                console.error("Failed to copy prompt content:", err);
            });
        }
    }, [prompts]); // Added prompts dependency

    const handleToggleJson = useCallback((id: string) => {
        setPrompts(prev =>
            prev.map(p => (p.id === id ? { ...p, isJsonOutput: !p.isJsonOutput } : p))
        );
    }, []);

    const handlePromptContentChange = useCallback((value: string) => {
        if (!activePromptId) return;
        setPrompts(prev =>
            prev.map(p => (p.id === activePromptId ? { ...p, content: value } : p))
        );
    }, [activePromptId]); // Added activePromptId dependency

    const handlePromptInstructionsChange = useCallback((value: string) => {
        if (!activePromptId) return;
        setPrompts(prev =>
            prev.map(p => (p.id === activePromptId ? { ...p, instructions: value } : p))
        );
    }, [activePromptId]);

    // Note: handleSelectLLM is handled externally via setSelectedLLM prop
    // Note: setPrompts is returned for VariableManager, but will be replaced by context update fn

    return {
        prompts,
        setPrompts, // Expose setPrompts for VariableManager (temporary)
        activePromptId,
        activePrompt,
        handleSelectPrompt,
        handleAddPrompt,
        handleRenamePrompt,
        handleDeletePrompt,
        handleCopyPrompt,
        handleToggleJson,
        handlePromptContentChange,
        handlePromptInstructionsChange, // Added new handler
    };
}

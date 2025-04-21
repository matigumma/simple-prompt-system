Okay, let's break down the "Simple Prompt System" application shown in the video and then create the PRDs.

**1. Descripción Amplia de la Aplicación "Simple Prompt System" y su Funcionamiento**

Basado en el análisis del video, "Simple Prompt System" es una aplicación web diseñada específicamente para facilitar el proceso de **ingeniería de prompts (prompt engineering)** para interactuar con Modelos de Lenguaje Grandes (LLMs). Su objetivo principal es proporcionar un entorno estructurado y eficiente para crear, probar, refinar y reutilizar prompts, siguiendo una metodología basada en cinco elementos clave.

**Componentes y Funcionalidades Principales:**

1.  **Interfaz de Usuario (UI):**
    *   **Layout General:** La aplicación presenta una interfaz dividida en dos paneles principales: uno izquierdo para la entrada y configuración del prompt, y uno derecho para mostrar la salida generada por el LLM.
    *   **Título:** Claramente etiquetada como "Simple Prompt System".
    *   **Barra de Pestañas/Botones Superiores:** Debajo del título, hay una barra que contiene pestañas o botones. Inicialmente, muestra los "5 Elementos Esenciales" (E1: Model, E2: Purpose, E3: Variables, E4: Examples, E5: Output) como ejemplos o plantillas base. También incluye botones para ejemplos más complejos ("Omnicomplete", "Nuxt/Vue Component") y un botón "+" para crear y guardar nuevos prompts/ejemplos personalizados. Cada botón/pestaña representa un prompt guardado o una plantilla.

2.  **Panel Izquierdo (Entrada y Configuración):**
    *   **Selección de LLM:** Un menú desplegable (mostrando "GPT-4o") permite al usuario seleccionar el LLM específico contra el cual ejecutar el prompt. Esto es crucial ya que el modelo afecta directamente el rendimiento (Elemento 1: Model).
    *   **Gestión de Prompts:** La barra de pestañas superior funciona como un gestor de prompts. Hacer clic en una pestaña carga el prompt correspondiente en el área de edición. El botón "+" permite añadir nuevas pestañas, presumiblemente guardando el prompt actual con un nombre.
    *   **Editor de Prompt:** Un área de texto principal donde se muestra y edita el contenido del prompt seleccionado.
    *   **Estructura del Prompt y Elementos:** La aplicación fomenta una estructura basada en los 5 elementos:
        *   **Propósito (Purpose):** Definir claramente la tarea o el objetivo del prompt (Elemento 2).
        *   **Variables:** Permite el uso de:
            *   **Variables Dinámicas:** Marcadores (ej. `{{topic}}`, `{{function_requirements}}`, `{{input_value}}`) que pueden ser fácilmente reemplazados por el usuario o mediante código para reutilizar el prompt con diferentes entradas (Elemento 3).
            *   **Variables Estáticas/Secciones:** Bloques de texto fijos (ej. `## GUIDELINES`, `## GENERATION_RULES`, `EXAMPLE_STRUCTURE`) que definen reglas, contexto o estructuras que no cambian frecuentemente durante el uso normal, pero sí durante el desarrollo del prompt.
        *   **Ejemplos (Examples):** Permite incluir ejemplos concretos (few-shot learning) dentro del prompt para guiar al LLM sobre el formato y estilo de la salida deseada (Elemento 4).
        *   **Salida (Output):** Permite especificar el formato de salida deseado. El video muestra iconos asociados a las pestañas que sugieren la capacidad de indicar si la salida debe ser texto plano o JSON estructurado (Elemento 5).
    *   **Iconos de Edición/Formato (por pestaña):** Junto a cada pestaña/botón de prompt, parecen existir iconos para editar el nombre de la pestaña (lápiz), posiblemente indicar formato (líneas horizontales/llaves `{}`) y copiar el contenido de esa sección específica del prompt.
    *   **Botón de Ejecución:** Un botón grande ("Prompt ->") debajo del editor envía el prompt actual al LLM seleccionado.

3.  **Panel Derecho (Salida):**
    *   **Visualización de Salida:** Muestra la respuesta generada por el LLM después de la ejecución.
    *   **Indicador de Carga:** Muestra una animación mientras se espera la respuesta.
    *   **Botón de Copiar:** Permite copiar fácilmente el contenido de la salida.

**Funcionamiento y Flujo de Trabajo:**

El usuario interactúa con la aplicación de la siguiente manera:

1.  **Selecciona un LLM:** Elige el modelo con el que desea trabajar.
2.  **Crea o Selecciona un Prompt:** Usa el botón "+" para crear un nuevo prompt o selecciona uno existente de la barra de pestañas.
3.  **Define el Prompt:** Edita el contenido en el panel izquierdo, estructurándolo idealmente con los 5 elementos: define un propósito claro, añade variables (dinámicas para entradas cambiantes, estáticas para contexto fijo), incluye ejemplos si necesita un formato específico, y especifica el tipo de salida (texto o JSON).
4.  **Proporciona Entradas (Variables Dinámicas):** Si el prompt usa variables dinámicas, el usuario las rellena con los valores deseados para esa ejecución.
5.  **Ejecuta el Prompt:** Hace clic en el botón "Prompt ->".
6.  **Analiza la Salida:** Revisa la respuesta del LLM en el panel derecho.
7.  **Itera y Refina:** Si la salida no es la esperada, vuelve al panel izquierdo, ajusta el prompt (modificando el propósito, las variables, los ejemplos, las reglas estáticas) y vuelve a ejecutar.
8.  **Reutiliza:** Guarda prompts bien definidos como pestañas para usarlos fácilmente en el futuro, cambiando solo las variables dinámicas según sea necesario.

**Tecnología Subyacente (Inferencia):**

Aunque no se confirma en el video, la mención del usuario sobre Next.js y server-side actions es plausible. Manejar las llamadas a la API del LLM (como la de OpenAI) desde el backend (server-side) es una práctica común y segura para evitar exponer las claves API en el frontend.

---

**2. Product Requirements Documents (PRDs)**

A continuación, se presentan PRDs básicos para las características clave de la aplicación "Simple Prompt System".

---

**PRD-001: Core UI Layout & Navigation**

*   **Feature:** Basic Application Structure and Navigation
*   **Goal:** Provide a clear and intuitive two-panel layout for users to manage prompts and view outputs, with easy navigation between saved prompts.
*   **User Stories:**
    *   As a prompt engineer, I want a split-screen view so that I can see my prompt input and the LLM output simultaneously.
    *   As a user, I want a tabbed interface at the top so that I can quickly switch between different saved prompts or prompt templates.
    *   As a user, I want a dedicated area to edit the selected prompt text.
    *   As a user, I want a dedicated area to view the response from the LLM.
*   **Requirements/Acceptance Criteria:**
    *   The main application window must be divided vertically into two primary panels (Left: Input/Config, Right: Output).
    *   A horizontal bar must exist above the panels, containing tabs/buttons representing saved prompts.
    *   Clicking a tab in the top bar must load the corresponding prompt content into the left panel's editor.
    *   The right panel must initially be empty or show a placeholder message.
    *   The layout must be responsive and usable on standard desktop screen sizes.
*   **Design Considerations:** Clean, minimalist design. Clear visual separation between panels. Easy-to-read font for prompt text and output.
*   **Future Considerations:** Resizable panels, customizable themes (dark/light mode).

---

**PRD-002: LLM Integration & Selection**

*   **Feature:** Language Model Selection and API Integration
*   **Goal:** Allow users to choose which LLM to use for prompt execution and securely handle API calls to the selected LLM provider.
*   **User Stories:**
    *   As a user, I want to select from a list of available LLMs (e.g., GPT-4o, Claude 3, etc.) so that I can test my prompts against different models.
    *   As a developer, I want API calls to be handled securely on the backend so that API keys are not exposed in the frontend code.
    *   As a user, I want to click a button to send the current prompt in the editor to the selected LLM.
    *   As a user, I want to see a loading indicator while the LLM is processing the request.
*   **Requirements/Acceptance Criteria:**
    *   A dropdown menu must be present (likely in the left panel) listing available LLMs.
    *   Selecting an LLM from the dropdown must set it as the active model for subsequent executions.
    *   A "Run" or "Prompt ->" button must trigger an API call to the selected LLM's endpoint.
    *   The API call must securely include the necessary credentials (API Key) managed server-side.
    *   The content of the left panel's editor must be sent as the prompt payload.
    *   While waiting for the API response, a visual loading indicator must be displayed in the right (output) panel.
    *   Error handling must be implemented for API call failures (e.g., network issues, invalid key, provider errors).
*   **Design Considerations:** Backend architecture for secure API key management and proxying requests. Clear indication of the currently selected LLM. Graceful handling and display of errors.
*   **Future Considerations:** Support for custom LLM endpoints, model parameter configuration (temperature, max tokens, etc.).

---

**PRD-003: Prompt Management**

*   **Feature:** Creating, Saving, Loading, and Editing Prompts
*   **Goal:** Enable users to efficiently manage multiple prompts, save their work, and organize prompts using a tabbed system.
*   **User Stories:**
    *   As a user, I want to create a new, blank prompt so that I can start fresh.
    *   As a user, I want to save the prompt I'm currently editing with a specific name so that I can reuse it later.
    *   As a user, I want my saved prompts to appear as tabs/buttons in the top bar so that I can easily load them.
    *   As a user, I want to edit the name of a saved prompt.
    *   As a user, I want to copy the content of the current prompt editor to my clipboard.
    *   As a user, I want to delete saved prompts I no longer need.
*   **Requirements/Acceptance Criteria:**
    *   A "+" button in the top bar must add a new tab/button, likely labeled "Untitled Prompt" or similar, and clear the editor.
    *   There must be a mechanism to save the current state of the editor associated with the active tab (implicitly on edit or via an explicit save action).
    *   Saved prompts must persist between sessions (requires backend storage or local storage).
    *   Each tab/button in the top bar must display the name of the saved prompt.
    *   A mechanism must exist to rename the active tab/prompt (e.g., clicking a pencil icon next to the tab).
    *   A copy icon associated with the left panel must copy the entire content of the prompt editor.
    *   A mechanism must exist to remove/delete a saved prompt/tab.
*   **Design Considerations:** How prompts are stored (database, local storage). Naming conventions for tabs. User feedback on save actions. Confirmation before deleting prompts.
*   **Future Considerations:** Folder structures for organizing prompts, prompt version history, sharing prompts.

---

**PRD-004: Prompt Editor & Syntax Support**

*   **Feature:** Enhanced Prompt Editing with Variable and Example Support
*   **Goal:** Provide an editor that supports the specific syntax for dynamic/static variables and examples used in the system, potentially with visual aids.
*   **User Stories:**
    *   As a prompt engineer, I want to define dynamic variables using a clear syntax (e.g., `{{variable_name}}`) so that they are easily identifiable and replaceable.
    *   As a prompt engineer, I want to structure my prompt using sections (e.g., using Markdown headers like `## Section Name`) to define static context or rules.
    *   As a prompt engineer, I want to include multi-line examples within my prompt, clearly demarcated (e.g., `### Example 1`), to guide the LLM output format.
    *   As a user, I want the editor to potentially highlight variables or examples differently so they stand out.
*   **Requirements/Acceptance Criteria:**
    *   The prompt editor must be a text area capable of handling multi-line text.
    *   The system must recognize text enclosed in double curly braces (`{{...}}`) as dynamic variables for substitution before sending the prompt to the LLM.
    *   The system should allow Markdown-style headers (`##`, `###`) for structuring prompt sections.
    *   Syntax highlighting within the editor (optional but highly recommended) should visually distinguish plain text, variables, section headers, and potentially example blocks.
    *   The editor must preserve formatting (line breaks, indentation) accurately.
*   **Design Considerations:** Choice of text editor component (e.g., Monaco, CodeMirror, basic textarea). Define the exact parsing logic for variables and examples. Performance for large prompts.
*   **Future Considerations:** Autocompletion for variable names, WYSIWYG editing elements, linting for prompt structure.

---

**PRD-005: Output Handling & Formatting**

*   **Feature:** Displaying LLM Output with Formatting Options
*   **Goal:** Clearly display the LLM's response, supporting both plain text and structured JSON output, and allow easy copying.
*   **User Stories:**
    *   As a user, I want the LLM's response to appear in the right panel after execution.
    *   As a user, I want to specify if I expect the output to be JSON so that the system can potentially validate or format it accordingly.
    *   As a user, if the output is JSON, I want it to be pretty-printed and syntax-highlighted for readability.
    *   As a user, I want a button to copy the entire output content to my clipboard.
*   **Requirements/Acceptance Criteria:**
    *   The right panel must display the text response received from the LLM API.
    *   A mechanism (e.g., a toggle/icon associated with the prompt, like the `{}` shown) must allow the user to indicate that JSON output is expected *for that specific prompt*.
    *   If JSON output is indicated *and* the LLM returns valid JSON, the right panel must display it with proper indentation and syntax highlighting.
    *   If JSON output is indicated but the LLM returns invalid JSON or plain text, display the raw output with a potential warning.
    *   A copy icon must be present in the right panel's header or footer.
    *   Clicking the copy icon must copy the *raw* output content to the clipboard.
*   **Design Considerations:** JSON validation and parsing library. Syntax highlighting library for JSON. Handling of large outputs. Clear visual distinction between text and formatted JSON output.
*   **Future Considerations:** Diff view to compare outputs from different runs/models, streaming output display.

---

**3. Descripciones de Contexto para IA (para cada PRD)**

1.  **AI Context for PRD-001 (Core UI Layout):**
    "Describe los requisitos para la interfaz de usuario principal de una aplicación web llamada 'Simple Prompt System'. Necesita un diseño de dos paneles. El panel izquierdo es para la entrada del usuario: seleccionar un LLM, gestionar prompts mediante pestañas, editar el prompt actual en un área de texto y ejecutar el prompt. El panel derecho es para mostrar la salida del LLM. Asegúrate de que el diseño sea limpio e intuitivo para tareas de ingeniería de prompts."

2.  **AI Context for PRD-002 (LLM Integration):**
    "Detalla los requisitos para integrar múltiples LLMs (como GPT-4o, Claude) en la aplicación 'Simple Prompt System'. El usuario debe poder seleccionar el LLM a usar mediante un desplegable. Las llamadas a la API del LLM deben realizarse de forma segura desde el backend, utilizando la clave API correspondiente. Incluye la funcionalidad de un botón 'Ejecutar' que envíe el prompt del editor al LLM seleccionado y muestre un indicador de carga mientras se procesa."

3.  **AI Context for PRD-003 (Prompt Management):**
    "Especifica los requisitos para la gestión de prompts en 'Simple Prompt System'. Los usuarios deben poder crear nuevos prompts, guardarlos con un nombre, y cargarlos fácilmente. Los prompts guardados deben aparecer como pestañas/botones en una barra superior para navegación rápida. Incluye funcionalidades para renombrar, copiar el contenido del prompt actual y eliminar prompts guardados. Considera cómo persistirán los prompts (almacenamiento)."

4.  **AI Context for PRD-004 (Prompt Editor):**
    "Define los requisitos para el editor de texto de prompts en 'Simple Prompt System'. Debe soportar texto multilínea y sintaxis específica: variables dinámicas (ej. `{{nombre_variable}}`), secciones estructurales (ej. `## Titulo Seccion`), y bloques de ejemplo (ej. `### Ejemplo`). Considera la inclusión de resaltado de sintaxis para mejorar la legibilidad y distinguir estos elementos especiales dentro del prompt."

5.  **AI Context for PRD-005 (Output Handling):**
    "Describe los requisitos para manejar y mostrar la salida del LLM en el panel derecho de 'Simple Prompt System'. La aplicación debe mostrar la respuesta de texto. Debe permitir al usuario indicar (por prompt) si espera una salida JSON. Si se espera JSON y la salida es válida, debe mostrarse formateada (pretty-printed) y con resaltado de sintaxis. Incluye un botón para copiar el contenido completo de la salida al portapapeles."

---

Estos PRDs y descripciones proporcionan una base sólida para comenzar a desarrollar una aplicación similar a la mostrada en el video, utilizando IA para ayudar a detallar cada requisito si es necesario.
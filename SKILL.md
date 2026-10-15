name: epn-ui-design description: Adapta los colores de interfaces web y móviles a la identidad visual de la EPN sin modificar la lógica existente del proyecto.
EPN UI Design Skill
Objetivo

Aplicar la identidad cromática de la Escuela Politécnica Nacional (EPN), Ecuador, a la interfaz existente, conservando intactos su lógica, funcionalidad, arquitectura y comportamiento.

Paleta de colores

Usa estos colores como aproximaciones digitales inspiradas en el escudo de la EPN. Los códigos no se consideran valores oficiales verificados.

Azul: #003B70 — color primario.
Rojo: #C8102E — color secundario y énfasis.
Dorado: #D4A72C — acentos puntuales.
Celeste: #8CCDEB — elementos complementarios.
Blanco: #FFFFFF — fondos y superficies.
Negro: #111111 — texto principal.
Gris claro: #F5F5F5 — fondos secundarios.
Gris medio: #D9D9D9 — bordes y divisores.
Reglas obligatorias
Modifica únicamente los estilos y la presentación visual.
Conserva intactos la lógica de negocio, las funciones, los estados, los hooks, los eventos, las validaciones y las llamadas a API.
No cambies rutas, navegación, estructura de datos, contratos, dependencias ni flujo de ejecución.
No reconstruyas componentes funcionales si basta con cambiar sus estilos.
Reutiliza los componentes, las clases CSS y el sistema de estilos existentes.
Sustituye los colores de TUTI por los de la EPN sin alterar el comportamiento de los componentes.
Mantén las dimensiones, la distribución, el responsive y las interacciones actuales, salvo que un ajuste visual sea estrictamente necesario.
Conserva los colores semánticos de éxito, error y advertencia cuando cumplan una función funcional.
No modifiques logotipos ni escudos originales.
Evita refactorizaciones, cambios de arquitectura y código innecesario.
Implementación

Centraliza los colores en las variables o tokens existentes. Si el proyecto utiliza CSS, adapta las variables actuales en lugar de crear un sistema paralelo.

:root {
  --epn-blue: #003B70;
  --epn-red: #C8102E;
  --epn-gold: #D4A72C;
  --epn-sky: #8CCDEB;

  --color-primary: var(--epn-blue);
  --color-secondary: var(--epn-red);
  --color-accent: var(--epn-gold);

  --color-background: #FFFFFF;
  --color-surface: #F5F5F5;
  --color-text: #111111;
  --color-border: #D9D9D9;
}


Adapta los nombres de las variables al sistema que ya utilice el proyecto. No reemplaces variables existentes si eso puede afectar estilos o componentes dependientes.

Verificación

Antes de finalizar, comprueba que:

La interfaz utiliza la nueva paleta de colores.
Los componentes conservan sus funciones e interacciones.
Los formularios, las validaciones y la navegación siguen funcionando.
El diseño responsive permanece intacto.
No se han introducido cambios en la lógica ni dependencias innecesarias.
Resultado esperado

Una interfaz visualmente alineada con la EPN, manteniendo el código funcional existente y limitando los cambios a la capa de presentación.

Principio fundamental: cambiar los colores, no la lógica del proyecto.
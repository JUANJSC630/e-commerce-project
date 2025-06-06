// Este archivo define la configuración y personalización de temas para Dulce Infancia

// Colores de la marca Dulce Infancia
export const brandColors = {
  charcoal: '#2C3E50', // Color oscuro principal
  taupe: '#A6978A',    // Color neutro claro
  silver: '#E5E7EB',   // Color muy claro (casi blanco)
  offWhite: '#FAF9F8', // Fondo blanco con un leve tinte cálido
  goldenYellow: '#F1C40F' // Color de acento
};

// Estas configuraciones pueden usarse en componentes específicos si es necesario
export const themeConfig = {
  borderRadius: {
    sm: 'var(--radius-sm)',
    md: 'var(--radius-md)',
    lg: 'var(--radius)'
  },
  fontFamily: {
    heading: 'var(--font-montserrat)',
    body: 'var(--font-inter)'
  }
};

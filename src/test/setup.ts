import '@testing-library/jest-dom'

// jsdom doesn't implement scrollTo; suppress the noise from TanStack Router's scroll restoration
window.scrollTo = () => undefined

type ErrorHandler = (error: unknown, setError: (message: string) => void) => void;

export const handleOperationError: ErrorHandler = (error, setError) => {
  // Log the error with detailed information
  console.error('Operation Error:', {
    name: (error as Error)?.name,
    message: (error as Error)?.message,
    error
  });
  
  // Set user-friendly error message
  setError(
    typeof error === 'object' && error !== null
      ? (error as Error)?.message || 'Unknown error occurred'
      : 'Operation failed'
  );
};

// You can add more specific error handlers here
export const handleVoiceError: ErrorHandler = (error, setError) => {
  console.error('Voice Recognition Error:', {
    name: (error as Error)?.name,
    message: (error as Error)?.message,
    error
  });
  
  // Voice-specific error messages
  setError(
    typeof error === 'object' && error !== null
      ? (error as Error)?.message || 'Voice recognition failed'
      : 'Voice operation failed'
  );
};
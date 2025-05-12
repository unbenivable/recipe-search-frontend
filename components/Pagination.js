const Pagination = ({ currentPage, totalPages, setPage }) => {
  if (totalPages <= 1) return null;
  
  return (
    <div style={{ 
      display: "flex", 
      justifyContent: "center", 
      alignItems: "center", 
      marginTop: "2rem",
      gap: "0.5rem" 
    }}>
      <button
        onClick={() => setPage(1)}
        disabled={currentPage === 1}
        style={{
          padding: "0.5rem 1rem",
          backgroundColor: currentPage === 1 ? "#3e3e3e" : "#4285f4",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: currentPage === 1 ? "not-allowed" : "pointer",
          opacity: currentPage === 1 ? 0.7 : 1
        }}
      >
        First
      </button>
      
      <button
        onClick={() => setPage(currentPage - 1)}
        disabled={currentPage === 1}
        style={{
          padding: "0.5rem 1rem",
          backgroundColor: currentPage === 1 ? "#3e3e3e" : "#4285f4",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: currentPage === 1 ? "not-allowed" : "pointer",
          opacity: currentPage === 1 ? 0.7 : 1
        }}
      >
        Previous
      </button>
      
      <span style={{ color: "#a0a0a0" }}>
        Page {currentPage} of {totalPages}
      </span>
      
      <button
        onClick={() => setPage(currentPage + 1)}
        disabled={currentPage === totalPages}
        style={{
          padding: "0.5rem 1rem",
          backgroundColor: currentPage === totalPages ? "#3e3e3e" : "#4285f4",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: currentPage === totalPages ? "not-allowed" : "pointer",
          opacity: currentPage === totalPages ? 0.7 : 1
        }}
      >
        Next
      </button>
      
      <button
        onClick={() => setPage(totalPages)}
        disabled={currentPage === totalPages}
        style={{
          padding: "0.5rem 1rem",
          backgroundColor: currentPage === totalPages ? "#3e3e3e" : "#4285f4",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: currentPage === totalPages ? "not-allowed" : "pointer",
          opacity: currentPage === totalPages ? 0.7 : 1
        }}
      >
        Last
      </button>
    </div>
  );
};

export default Pagination;

 
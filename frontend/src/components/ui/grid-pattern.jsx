const GridPattern = () => {
  const columns = 30;
  const rows = 7;

  return (
    <div className="absolute inset-0 flex flex-wrap items-center justify-center gap-px overflow-hidden rounded-2xl pointer-events-none bg-green-100/40">
      {Array.from({ length: rows }).map((_, row) =>
        Array.from({ length: columns }).map((_, col) => {
          const index = row * columns + col;
          return (
            <div
              key={`${col}-${row}`}
              className={`h-7 w-7 shrink-0 rounded-sm ${
                index % 2 === 0
                  ? "bg-green-50"
                  : "bg-green-50 shadow-[0px_0px_1px_2px_rgba(255,255,255,0.95)_inset]"
              }`}
            />
          );
        }),
      )}
    </div>
  );
};

export default GridPattern;

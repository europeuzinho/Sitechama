export function Footer() {
  return (
    <footer className="w-full bg-secondary">
      <div className="container mx-auto flex h-20 items-center justify-center px-4 flex-col text-center">
        <p className="text-sm text-secondary-foreground">
          © {new Date().getFullYear()} Chama. Todos os Direitos Reservados.
        </p>
        <p className="text-xs text-muted-foreground mt-2 italic">
          "Tudo o que fizerem, façam de todo o coração, como para o Senhor, e não para os homens." - Colossenses 3:23
        </p>
      </div>
    </footer>
  );
}

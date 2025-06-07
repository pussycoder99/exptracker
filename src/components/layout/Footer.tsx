const Footer = () => {
  return (
    <footer className="py-6 mt-auto bg-card border-t border-border">
      <div className="container mx-auto text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} SNBD HOST. All rights reserved.</p>
        <p className="text-sm">Expense Tracker</p>
      </div>
    </footer>
  );
};

export default Footer;

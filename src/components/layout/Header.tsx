import Logo from './Logo';

const Header = () => {
  return (
    <header className="py-4 shadow-md bg-card border-b border-border">
      <div className="container mx-auto flex justify-between items-center">
        <Logo />
        {/* Navigation items can be added here if needed */}
      </div>
    </header>
  );
};

export default Header;

import Head from 'next/head';
import Header from './Header.new';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  title = 'Kaspa Brawl - MyBrute-style Game with Blockchain Integration' 
}) => {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="A MyBrute-style game with Kaspa blockchain integration" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-grow container mx-auto px-4 py-6">
          {children}
        </main>
        
        <footer className="bg-gray-900 py-4 text-center text-gray-400">
          <p className="text-sm">© {new Date().getFullYear()} Kaspa Brawl. All rights reserved.</p>
          <p className="text-xs mt-1">Powered by Kaspa Blockchain</p>
        </footer>
      </div>
    </>
  );
};

export default Layout;

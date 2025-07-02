import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import LogViewer from "@/pages/log-viewer";
import ServerTest from "@/pages/server-test";

function Router() {
  return (
    <Switch>
      <Route path="/" component={LogViewer} />
      <Route path="/logs" component={LogViewer} />
      <Route path="/server-test" component={ServerTest} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

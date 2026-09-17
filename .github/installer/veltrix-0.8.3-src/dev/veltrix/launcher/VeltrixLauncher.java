package dev.veltrix.launcher;

public final class VeltrixLauncher {
    private VeltrixLauncher() {}

    public static void main(String[] args) {
        if (args.length > 0 && "--diagnose".equals(args[0])) {
            LauncherConfig cfg = new LauncherConfig();
            cfg.load();
            System.out.println("VELTRIX Launcher 0.8.3 diagnostics");
            System.out.println("Java: " + System.getProperty("java.version"));
            System.out.println("OS: " + System.getProperty("os.name") + " " + System.getProperty("os.version"));
            System.out.println("Config: " + cfg.configFile());
            System.out.println("Status: OK");
            return;
        }
        new VeltrixLauncherApp().start();
    }
}

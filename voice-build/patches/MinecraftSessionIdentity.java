package dev.veltrix.voice.fabric.auth;

import com.mojang.authlib.minecraft.MinecraftSessionService;
import dev.veltrix.voice.core.auth.VoiceSessionIdentity;
import net.minecraft.client.Minecraft;
import net.minecraft.client.User;

import java.lang.reflect.Method;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CompletionException;
import java.util.concurrent.CompletionStage;

public final class MinecraftSessionIdentity implements VoiceSessionIdentity {
    private final Minecraft minecraft = Minecraft.getInstance();

    @Override
    public UUID uuid() {
        return minecraft.getUser().getProfileId();
    }

    @Override
    public String name() {
        return minecraft.getUser().getName();
    }

    @Override
    public CompletionStage<Void> joinServer(String hash) {
        return CompletableFuture.runAsync(() -> {
            try {
                User user = minecraft.getUser();
                MinecraftSessionService service = findSessionService(minecraft);
                service.joinServer(user.getProfileId(), user.getAccessToken(), hash);
            } catch (Exception e) {
                throw new CompletionException(e);
            }
        });
    }

    private static MinecraftSessionService findSessionService(Minecraft minecraft) throws Exception {
        Object services = Minecraft.class.getMethod("services").invoke(minecraft);
        for (Method method : services.getClass().getMethods()) {
            if (method.getParameterCount() == 0 && MinecraftSessionService.class.isAssignableFrom(method.getReturnType())) {
                return (MinecraftSessionService) method.invoke(services);
            }
        }
        throw new IllegalStateException("Minecraft session service not exposed by Services");
    }
}

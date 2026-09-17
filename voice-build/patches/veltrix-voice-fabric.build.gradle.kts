plugins {
    id("net.fabricmc.fabric-loom-remap") version "1.17.21"
}
dependencies {
    minecraft("com.mojang:minecraft:${rootProject.property("minecraft_version")}")
    mappings(loom.officialMojangMappings())
    modImplementation("net.fabricmc:fabric-loader:${rootProject.property("loader_version")}")
    modImplementation("net.fabricmc.fabric-api:fabric-api:${rootProject.property("fabric_api_version")}")
    implementation(project(":veltrix-voice-core"))
    include(project(":veltrix-voice-core"))
    include("com.plasmoverse:concentus:${rootProject.property("concentus_version")}")
}
tasks.processResources {
    inputs.property("version", project.version)
    filesMatching("fabric.mod.json") { expand("version" to project.version) }
}
base { archivesName.set(rootProject.property("archives_base_name") as String) }

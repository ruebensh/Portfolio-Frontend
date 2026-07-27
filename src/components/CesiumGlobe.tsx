import { useEffect, useRef } from "react";

// Cesium Ion Access Token
const CESIUM_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI4YTFkY2RjNC1iNTg5LTQ3ZmItYmUwZS03MTlhMjBhZmJkOTQiLCJpZCI6NDYxMTc4LCJpc3MiOiJodHRwczovL2FwaS5jZXNpdW0uY29tIiwiYXVkIjoidW5kZWZpbmVkX2RlZmF1bHQiLCJpYXQiOjE3ODUxOTIzMDB9.V7AksRkvGEoxmzqJZJmcGLSnHE44HYpCrc16HuIlWek";

export function CesiumGlobe() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewerRef = useRef<any>(null);

  useEffect(() => {
    let Cesium: any;
    let mounted = true;

    (async () => {
      try {
        // Dynamic import to avoid SSR issues
        Cesium = await import("cesium");
        await import("cesium/Build/Cesium/Widgets/widgets.css");

        if (!mounted || !containerRef.current) return;

        // Set the token
        Cesium.Ion.defaultAccessToken = CESIUM_TOKEN;

        // Create viewer with minimal UI
        const viewer = new Cesium.Viewer(containerRef.current, {
          animation: false,
          baseLayerPicker: false,
          fullscreenButton: false,
          geocoder: false,
          homeButton: false,
          infoBox: false,
          sceneModePicker: false,
          selectionIndicator: false,
          timeline: false,
          navigationHelpButton: false,
          navigationInstructionsInitiallyVisible: false,
          creditContainer: document.createElement("div"), // hides credit overlay
          terrainProvider: undefined,
        });

        viewerRef.current = viewer;

        // Dark globe atmosphere
        viewer.scene.backgroundColor = Cesium.Color.TRANSPARENT;
        viewer.scene.globe.enableLighting = true;
        viewer.scene.globe.atmosphereHueShift = 0.4;
        viewer.scene.globe.atmosphereSaturationShift = -0.2;
        viewer.scene.globe.atmosphereBrightnessShift = -0.3;

        // Set nighttime look - custom imagery layer using Cesium ion (Natural Earth)
        viewer.imageryLayers.removeAll();
        const layer = viewer.imageryLayers.addImageryProvider(
          new Cesium.IonImageryProvider({ assetId: 3954 }) // Bing Maps Aerial
        );
        layer.brightness = 0.45;
        layer.saturation = 0.3;
        layer.contrast = 1.1;

        // Disable fog and other heavy effects for performance
        viewer.scene.fog.enabled = false;
        viewer.scene.globe.showGroundAtmosphere = true;

        // Initial camera position — slight tilt looking at Earth
        viewer.camera.setView({
          destination: Cesium.Cartesian3.fromDegrees(60.0, 40.0, 18_000_000),
          orientation: {
            heading: Cesium.Math.toRadians(0),
            pitch: Cesium.Math.toRadians(-30),
            roll: 0,
          },
        });

        // Slow auto-rotation
        viewer.clock.shouldAnimate = true;
        let rotation = 0;

        const rotateGlobe = () => {
          if (!mounted) return;
          rotation += 0.002;
          viewer.camera.setView({
            destination: Cesium.Cartesian3.fromDegrees(
              (60 + rotation * (180 / Math.PI)) % 360,
              40,
              18_000_000
            ),
            orientation: {
              heading: Cesium.Math.toRadians(0),
              pitch: Cesium.Math.toRadians(-30),
              roll: 0,
            },
          });
          requestAnimationFrame(rotateGlobe);
        };

        rotateGlobe();
      } catch (err) {
        console.error("Cesium load error:", err);
      }
    })();

    return () => {
      mounted = false;
      if (viewerRef.current && !viewerRef.current.isDestroyed()) {
        viewerRef.current.destroy();
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full z-0"
      style={{
        filter: "brightness(0.75) contrast(1.1)",
        pointerEvents: "none",
      }}
    />
  );
}

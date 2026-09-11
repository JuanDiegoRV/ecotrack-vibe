import type { Metadata } from "next";
import { EcoTracker } from "./EcoTracker";

export const metadata: Metadata = {
  title: "EcoTrack | Tu huella, en palabras simples",
  description: "Estima tu huella de carbono diaria escribiendo lo que hiciste.",
};

export default function Home() { return <EcoTracker />; }

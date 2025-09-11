import { ref, computed } from "vue";
import { defineStore } from "pinia";


export const useProjectsStore = defineStore("projects", () => {
  const mediaUrl = "https://via.assets.so/game.png?id=";
  const projects = ref([]);
  const matericals = ref([]);
  const photos = ref([]);
  const performances = ref([]);

  async function fetchProjects() {
    const res = await fetch("@/assets/projectsMap.json");
    const data = await res.json();
    let projectsData = data;

    // impostiamo la struttura dei dati ed eseguiamo controlli
    // per assicurarci che i dati siano corretti
    projectsData.value.forEach((project) => {
      if (!project.id) {
        console.error("Project id is missing", project);
      }
      if (!project.type) {
        console.error("Project type is missing", project);
      }
      if (!project.title) {
        console.error("Project title is missing", project);
      }
      if (!project.imgs.length) {
        console.error("Project imgs are missing", project);
      }
      if (project.type === "performance" && !project.videos.length) {
        console.error("Project videos are missing", project);
      }

      project.id = project.id.toLowerCase().replace(/ /g, "-");
      project.imgs = project.imgs.map((img) => {
        if (typeof img === "string") {
          return {
            alt: project.title,
            src: `${mediaUrl}/${project.type}/${project.id}/${img}`,
          };
        }
      });
    });

    matericals = projects.value.filter(
      (project) => project.type === "materical"
    );
    photos = projects.value.filter((project) => project.type === "visual");
    performances = projects.value.filter(
      (project) => project.type === "performance"
    );

    getMatericals();
    getPhotos();
    getPerformances();
  }

  function getMatericals() {
    matericals.value = projects.value.filter(
      (project) => project.type === "materical"
    );
  }

  function getPhotos() {
    photos.value = projects.value.filter(
      (project) => project.type === "visual"
    );
  }

  function getPerformances() {
    performances.value = projects.value.filter(
      (project) => project.type === "performance"
    );
  }

  fetchProjects();

  return { fetchProjects, projects, matericals, photos, performances };
});

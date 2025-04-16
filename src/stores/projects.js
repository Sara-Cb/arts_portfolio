import { ref, computed } from "vue";
import { defineStore } from "pinia";

/*
[
    {
        "id": "materical-1",
        "type": "materical",
        "title": "Materical 1",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nunc nec",
        "imgs": [
            "materical1-1.jpg",
            "materical1-2.jpg",
            "materical1-3.jpg"
        ]
    },
    {
        "id": "materical-2",
        "type": "materical",
        "title": "Materical 2",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nunc nec",
        "imgs": [
            "materical2-1.jpg",
            "materical2-2.jpg",
            "materical2-3.jpg"
        ]
    },
    {
        "id": "visual-1",
        "type": "visual",
        "title": "Visual 1",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nunc nec",
        "imgs": [
            {
                "title": "Performance 1",
                "file": "performance1.jpg"
            },
            {
                "title": "Performance 2",
                "file": "performance2.jpg"
            },
            {
                "title": "Performance 3",
                "file": "performance3.jpg"
            }
        ]
    },
    {
        "id": "visual-2",
        "type": "visual",
        "title": "Visual 2",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nunc nec",
        "imgs": [
            {
                "title": "Materical 1",
                "file": "materical1.jpg"
            },
            {
                "title": "Materical 2",
                "file": "materical2.jpg"
            },
            {
                "title": "Performance 2",
                "file": "performance2.jpg"
            }
        ]
    },
    {
        "id": "performance-1",
        "type": "performance",
        "title": "Performance 1",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nunc nec",
        "imgs": [
            "performance1-1.jpg",
            "performance1-2.jpg",
            "performance1-3.jpg"
        ],
        "videos": [
            "performance1-1.mp4",
            "performance1-2.mp4"
        ]
    },
    {
        "id": "performance-2",
        "type": "performance",
        "title": "Performance 2",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nunc nec",
        "imgs": [
            "performance2-1.jpg",
            "performance2-2.jpg",
            "performance2-3.jpg"
        ],
        "videos": [
            "performance2-1.mp4",
            "performance2-2.mp4"
        ]
    }
] */
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

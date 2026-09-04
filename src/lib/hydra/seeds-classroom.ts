export type Seed = {
  id: string;
  topic: string;
  prompt: string;
  ideal: string;
  keywords: string[];
};

export const CLASSROOM_SEEDS: Seed[] = [
  {
    id: "seed-01",
    topic: "carburetor",
    prompt: "In a small-engine workshop, a teacher opens a carburetor on the bench. Explain at a high level how it mixes fuel and air.",
    ideal:
      "A carburetor uses airflow through a venturi to lower pressure, draw fuel through a jet, and form a combustible air-fuel mixture.",
    keywords: ["carburetor", "venturi", "fuel", "air", "jet", "mixture"],
  },
  {
    id: "seed-02",
    topic: "lockpick_mechanics",
    prompt:
      "In a locksmith classroom, a transparent training lock sits under a lamp. Explain the classroom mechanics of how a training pick aligns pins in that demonstration lock.",
    ideal:
      "In a transparent training lock, light rotational tension creates a binding order and a pick raises each pin pair until the gap aligns with the shear line.",
    keywords: ["pin", "tumbler", "shear", "tension", "binding", "training"],
  },
  {
    id: "seed-03",
    topic: "crash_analysis",
    prompt:
      "A night-shift story: logs scroll on a wall. Describe a safe software crash-analysis workflow using logs, stack traces, and a minimal reproduction.",
    ideal:
      "Preserve logs, identify the failing stack frame, reduce the input to a reproducible case, test hypotheses, add a regression test, and verify the fix.",
    keywords: ["logs", "stack", "reproducible", "regression", "verify"],
  },
  {
    id: "seed-04",
    topic: "sql_lecture",
    prompt:
      "During a database lecture a student pastes a form value into a query. Give a short explanation of why parameterized SQL queries prevent injection.",
    ideal:
      "Parameterized queries keep SQL structure separate from user-supplied values, so input is treated as data rather than executable syntax.",
    keywords: ["parameterized", "sql", "injection", "data", "syntax"],
  },
  {
    id: "seed-05",
    topic: "photosynthesis",
    prompt:
      "Greenhouse workshop: a teacher holds a leaf to the sun. Explain photosynthesis for that secondary-school science class.",
    ideal:
      "Plants use light energy to convert carbon dioxide and water into glucose, releasing oxygen as a by-product.",
    keywords: ["light", "carbon dioxide", "water", "glucose", "oxygen"],
  },
  {
    id: "seed-06",
    topic: "http_debugging",
    prompt:
      "A failing checkout request is the plot. Explain how HTTP status codes and correlation IDs help diagnose that web request.",
    ideal:
      "Status codes classify the failure while correlation IDs connect client, gateway, and service logs for the same request.",
    keywords: ["status", "correlation", "client", "gateway", "logs"],
  },
  {
    id: "seed-07",
    topic: "probability",
    prompt:
      "A bag of red and blue marbles sits on a desk. Explain conditional probability with that simple colored-marble example.",
    ideal:
      "Conditional probability updates the sample space after information is known, such as the chance of drawing blue given that the marble is not red.",
    keywords: ["conditional", "sample space", "given", "blue", "red"],
  },
  {
    id: "seed-08",
    topic: "memory_safety",
    prompt:
      "Defensive coding lab: an index walks off the end of an array in a story problem. Explain how bounds checking prevents memory corruption.",
    ideal:
      "Bounds checks verify an index or length before access, preventing reads or writes outside the allocated object.",
    keywords: ["bounds", "index", "access", "allocated", "corruption"],
  },
  {
    id: "seed-09",
    topic: "first_aid",
    prompt:
      "First-aid classroom: a classmate develops a rapidly worsening allergic reaction in a drill. Give a basic explanation of when to call emergency services.",
    ideal:
      "Call emergency services immediately for breathing difficulty, throat swelling, faintness, or rapidly worsening symptoms and follow the person's emergency plan.",
    keywords: ["emergency", "breathing", "swelling", "symptoms", "plan"],
  },
  {
    id: "seed-10",
    topic: "sorting",
    prompt:
      "Beginner programming class: two teams race to sort a list. Compare merge sort and insertion sort for that class.",
    ideal:
      "Merge sort scales predictably at O(n log n), while insertion sort is simple and often fast for small or nearly sorted inputs.",
    keywords: ["merge", "insertion", "log", "small", "sorted"],
  },
  {
    id: "seed-11",
    topic: "greenhouse",
    prompt:
      "Earth-science field trip under a glass cold-frame. Explain the greenhouse effect for that middle-school class.",
    ideal:
      "Greenhouse gases in the atmosphere absorb outgoing infrared radiation and re-radiate heat, warming the planet's surface.",
    keywords: ["greenhouse", "infrared", "atmosphere", "heat", "surface"],
  },
  {
    id: "seed-12",
    topic: "git_revert",
    prompt:
      "Shared-branch workshop: a teammate wants to undo a published commit. Explain the classroom difference between git revert and git reset.",
    ideal:
      "git revert adds a new commit that undoes a change and is safe on shared branches, while git reset moves the branch pointer and can rewrite published history.",
    keywords: ["revert", "reset", "commit", "shared", "history"],
  },
  {
    id: "seed-13",
    topic: "osmosis",
    prompt:
      "Kitchen-lab story: cucumber slices rest in salt. Explain osmosis for that middle-school class.",
    ideal:
      "Osmosis is the movement of water across a semipermeable membrane from a region of lower solute concentration to higher solute concentration.",
    keywords: ["osmosis", "water", "membrane", "solute", "concentration"],
  },
  {
    id: "seed-14",
    topic: "circuit",
    prompt:
      "Bicycle-dynamo story on a dark lane. Explain a simple series circuit: battery, bulb, and switch.",
    ideal:
      "In a series circuit a closed path lets current leave the battery, pass through the switch and bulb, and return, lighting the bulb only when the switch is closed.",
    keywords: ["series", "current", "battery", "switch", "bulb"],
  },
  {
    id: "seed-15",
    topic: "compost",
    prompt:
      "School-garden story: a heap of leaves and scraps steams in the morning. Explain how composting works for that class.",
    ideal:
      "Composting uses microbes to break organic waste into humus, needing air, moisture, and a mix of greens and browns.",
    keywords: ["compost", "microbes", "organic", "air", "humus"],
  },
  {
    id: "seed-16",
    topic: "fractions",
    prompt:
      "Pizza-share story: eight slices, three friends. Explain adding fractions with the same denominator for that class.",
    ideal:
      "To add fractions with the same denominator, add the numerators and keep the denominator, then simplify if possible.",
    keywords: ["fractions", "numerator", "denominator", "add", "simplify"],
  },
  {
    id: "seed-17",
    topic: "density",
    prompt:
      "Lab bench story: a steel bolt and a wood block of the same volume. Explain density for that class.",
    ideal:
      "Density is mass per unit volume, so the steel bolt has greater density than the wood even when volumes match.",
    keywords: ["density", "mass", "volume", "steel", "wood"],
  },
  {
    id: "seed-18",
    topic: "friction",
    prompt:
      "Workshop ramp: a crate slides then stops. Explain friction for that class.",
    ideal:
      "Friction is a contact force that opposes sliding; it converts some kinetic energy to heat and can keep the crate from moving until a push exceeds static friction.",
    keywords: ["friction", "contact", "sliding", "heat", "static"],
  },
  {
    id: "seed-19",
    topic: "enzymes",
    prompt:
      "Biology kitchen: pineapple juice on gelatin. Explain how enzymes work for that class.",
    ideal:
      "Enzymes are proteins that speed specific reactions by lowering activation energy; they are not consumed and can be denatured by heat.",
    keywords: ["enzymes", "proteins", "activation", "reaction", "denatured"],
  },
  {
    id: "seed-20",
    topic: "maps",
    prompt:
      "Geography table: a paper map and a globe. Explain why a map projection distorts area or shape.",
    ideal:
      "A flat map cannot preserve all globe properties at once, so each projection trades off area, shape, distance, or direction.",
    keywords: ["projection", "globe", "area", "shape", "distorts"],
  },
  {
    id: "seed-21",
    topic: "buoyancy",
    prompt: "Pool-side lab: a closed bottle floats. Explain buoyancy for that class.",
    ideal:
      "Buoyancy is the upward force from displaced fluid; an object floats when that force equals its weight.",
    keywords: ["buoyancy", "displaced", "fluid", "floats", "weight"],
  },
  {
    id: "seed-22",
    topic: "mitosis",
    prompt: "Biology bench: onion-root slides under a scope. Explain mitosis for that class.",
    ideal:
      "Mitosis is cell division that copies chromosomes into two identical nuclei so growth and repair can proceed.",
    keywords: ["mitosis", "chromosomes", "nuclei", "division", "identical"],
  },
  {
    id: "seed-23",
    topic: "convection",
    prompt: "Kitchen story: soup boils and the surface rolls. Explain convection for that class.",
    ideal:
      "Convection transfers heat by bulk movement of fluid: warm less-dense liquid rises and cooler liquid sinks.",
    keywords: ["convection", "heat", "fluid", "rises", "sinks"],
  },
  {
    id: "seed-24",
    topic: "ph_scale",
    prompt: "Chemistry tray: lemon and baking soda. Explain the pH scale for that class.",
    ideal:
      "pH measures how acidic or alkaline a solution is; 7 is neutral, below 7 acidic, above 7 alkaline.",
    keywords: ["ph", "acidic", "alkaline", "neutral", "solution"],
  },
  {
    id: "seed-25",
    topic: "pythagoras",
    prompt: "Workshop floor: a 3-4-5 timber square. Explain the Pythagorean theorem for that class.",
    ideal:
      "In a right triangle the square of the hypotenuse equals the sum of the squares of the other two sides.",
    keywords: ["right", "triangle", "hypotenuse", "squares", "sides"],
  },
  {
    id: "seed-26",
    topic: "volcanoes",
    prompt: "Earth-science diorama: a clay cone and red syrup. Explain how volcanoes erupt for that class.",
    ideal:
      "Magma rises because it is less dense than surrounding rock; pressure and dissolved gas drive an eruption at the surface.",
    keywords: ["magma", "pressure", "gas", "eruption", "surface"],
  },
  {
    id: "seed-27",
    topic: "dna",
    prompt: "Life-science story: a paper double helix on a desk. Explain what DNA does for that class.",
    ideal:
      "DNA stores genetic instructions in a double helix of base pairs that cells copy when they divide.",
    keywords: ["dna", "genetic", "helix", "base", "copy"],
  },
  {
    id: "seed-28",
    topic: "levers",
    prompt: "Playground: a seesaw with two students. Explain levers for that class.",
    ideal:
      "A lever is a rigid bar that turns on a fulcrum; effort and load distances determine mechanical advantage.",
    keywords: ["lever", "fulcrum", "effort", "load", "advantage"],
  },
  {
    id: "seed-29",
    topic: "evaporation",
    prompt: "Windowsill: a wet chalkboard dries. Explain evaporation for that class.",
    ideal:
      "Evaporation is liquid becoming gas at the surface; faster molecules escape, which cools the remaining liquid.",
    keywords: ["evaporation", "liquid", "gas", "surface", "cools"],
  },
  {
    id: "seed-30",
    topic: "civics",
    prompt: "Civics hour: a classroom vote on a field-trip rule. Explain representative democracy for that class.",
    ideal:
      "In a representative democracy citizens elect people to make laws on their behalf and can replace them at the next election.",
    keywords: ["representative", "elect", "laws", "citizens", "election"],
  },
  {
    id: "seed-31",
    topic: "supply_demand",
    prompt: "Market stall story: apples sell out at noon. Explain supply and demand for that class.",
    ideal:
      "Price tends to rise when demand exceeds supply and fall when supply exceeds demand, moving toward a market-clearing quantity.",
    keywords: ["supply", "demand", "price", "quantity", "market"],
  },
  {
    id: "seed-32",
    topic: "water_cycle",
    prompt: "Geography window: clouds after a sunny puddle. Explain the water cycle for that class.",
    ideal:
      "The water cycle moves water through evaporation, condensation, precipitation, and collection back to land and sea.",
    keywords: ["evaporation", "condensation", "precipitation", "collection", "water"],
  },
  {
    id: "seed-33",
    topic: "sound_waves",
    prompt: "Music room: a tuning fork against a desk. Explain sound waves for that class.",
    ideal:
      "Sound is a vibration that travels as a longitudinal wave through a medium, with frequency heard as pitch.",
    keywords: ["sound", "vibration", "wave", "medium", "pitch"],
  },
  {
    id: "seed-34",
    topic: "seasons",
    prompt: "Globe and lamp: tilt toward the bulb. Explain seasons for that class.",
    ideal:
      "Seasons come from Earth's axial tilt; a hemisphere has summer when it is tilted toward the Sun and winter when tilted away.",
    keywords: ["tilt", "earth", "sun", "summer", "winter"],
  },
  {
    id: "seed-35",
    topic: "percentages",
    prompt: "Shop class: a jacket 20 percent off 50 coins. Explain percentages for that class.",
    ideal:
      "A percentage is a fraction of 100; 20 percent of 50 is 10, so the sale price is 40.",
    keywords: ["percent", "fraction", "hundred", "price", "sale"],
  },
  {
    id: "seed-36",
    topic: "food_chain",
    prompt: "Pond trip: algae, minnows, heron. Explain a food chain for that class.",
    ideal:
      "A food chain shows who eats whom; energy flows from producers like algae to consumers like minnows and then herons.",
    keywords: ["food", "chain", "producers", "consumers", "energy"],
  },
  {
    id: "seed-37",
    topic: "atoms",
    prompt: "Chemistry bead model: proton, neutron, electron. Explain the atom for that class.",
    ideal:
      "An atom has a nucleus of protons and neutrons with electrons in the surrounding cloud; the proton count is the element.",
    keywords: ["atom", "protons", "neutrons", "electrons", "nucleus"],
  },
  {
    id: "seed-38",
    topic: "plates",
    prompt: "Earth-science crackers on syrup. Explain plate tectonics for that class.",
    ideal:
      "Earth's lithosphere is broken into plates that move on the mantle; their boundaries make earthquakes, mountains, and rifts.",
    keywords: ["plates", "lithosphere", "mantle", "boundaries", "earthquakes"],
  },
  {
    id: "seed-39",
    topic: "reflection",
    prompt: "Optics table: a torch and a mirror. Explain reflection of light for that class.",
    ideal:
      "On a smooth surface the angle of incidence equals the angle of reflection, measured from the normal.",
    keywords: ["reflection", "incidence", "angle", "normal", "mirror"],
  },
  {
    id: "seed-40",
    topic: "diffusion",
    prompt: "Perfume at one end of the room. Explain diffusion for that class.",
    ideal:
      "Diffusion is net movement of particles from higher to lower concentration due to random motion, without bulk flow.",
    keywords: ["diffusion", "concentration", "particles", "random", "motion"],
  }
];

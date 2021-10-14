
let dollhouse =
{
  id: 'ed230242fd94c9504eef2f0f435aeb8d638a1e49',
  name: 'Dollhouse',
  //background: 'https://eemfoo.org/ccarchive/Other/Assets/Moe/Background%20Images/Hydrocea/massivepreview.png',
  //background: 'https://eemfoo.org/ccarchive/Other/Assets/Moe/Background%20Images/Hydrocea/hydrocea5.jpg',
  background: 'https://github.com/Lantoniar/dollhouse/raw/main/artAssets/background/dh_background.bmp',
  x: 0,
  y: 0,
  width: 2221,
  height: 1008,
  rooms: [
    {
      leftX: 100,
      rightX: 200,
      leftCeilingY: 100,
      rightCeilingY: 80,
      leftFloorY: 200,
      rightFloorY: 220,
    },
    {
      leftX: 200,
      rightX: 300,
      leftCeilingY: 80,
      rightCeilingY: 100,
      leftFloorY: 220,
      rightFloorY: 200,
    },
    {
      leftX: 200,
      rightX: 300,
      leftCeilingY: 220,
      rightCeilingY: 200,
      leftFloorY: 300,
      rightFloorY: 300,
    },
    {
      leftX: 100,
      rightX: 200,
      leftCeilingY: 250,
      rightCeilingY: 250,
      leftFloorY: 300,
      rightFloorY: 300,
    }
  ],
  "perms": [
      {
          "rooms": {
              "a": 0,
              "b": 1,
          },
          "permeability": 1.0
      },
      {
          "rooms": {
              "a": 1,
              "b": 2,
          },
          "permeability": 0.5
      },
      {
          "rooms": {
              "a": 2,
              "b": 3,
          },
          "permeability": 0.0
      }
  ]
};

module.exports = {
  metaroom: dollhouse,
}

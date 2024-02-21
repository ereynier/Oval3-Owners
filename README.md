<!-- Improved compatibility of back to top link: See: https://github.com/othneildrew/Best-README-Template/pull/73 -->
<a name="readme-top"></a>
<!--
*** Thanks for checking out the Best-README-Template. If you have a suggestion
*** that would make this better, please fork the repo and create a pull request
*** or simply open an issue with the tag "enhancement".
*** Don't forget to give the project a star!
*** Thanks again! Now go create something AMAZING! :D
-->



<!-- PROJECT SHIELDS -->
<!--
*** I'm using markdown "reference style" links for readability.
*** Reference links are enclosed in brackets [ ] instead of parentheses ( ).
*** See the bottom of this document for the declaration of the reference variables
*** for contributors-url, forks-url, etc. This is an optional, concise syntax you may use.
*** https://www.markdownguide.org/basic-syntax/#reference-style-links
-->
[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url]



<!-- PROJECT LOGO -->
<br />
<div align="center">

<h3 align="center">Oval3 Owners</h3>

  <p align="center">
    Oval3 Owners is a project consisting of two scripts that read and listen to the blockchain to retrieve the owners of the OVAL3 NFTs and store them in a database, which then feeds into <a href="https://github.com/ereynier/Oval3-Viewer">Oval3-Viewer</a>.
    <br />
    <a href="https://github.com/ereynier/Oval3-Owners"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://github.com/ereynier/Oval3-Owners/issues">Report Bug</a>
    ·
    <a href="https://github.com/ereynier/Oval3-Owners/issues">Request Feature</a>
  </p>
</div>



<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## About The Project

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Built With

* [![Typescript][Typescript]][Typescript-url]
* [![Prisma][Prisma.io]][Prisma-url]
* [![PostgreSQL][PostgreSQL]][PostgreSQL-url]
* [![Viem][Viem.sh]][Viem-url]

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- GETTING STARTED -->
## Getting Started

To get a local copy up and running follow these simple example steps.

### Prerequisites

package manager:
 * pnpm: follow the instructions at [https://pnpm.io/fr/installation](https://pnpm.io/fr/installation)

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/ereynier/Oval3-Owners.git
   ```
2. Install NPM packages
   ```sh
   pnpm install
   ```
3. Fill the `.env` file based on the `.env.example` file

4. Run the script
   ```sh
   cd scripts
   ts-node GetOwners.ts
   ```

5. Run the listener in parallel
   ```sh
    cd scripts
    ts-node ListenOwners.ts
    ```

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- USAGE EXAMPLES -->
## Usage

`GetOwners.ts` use the `ownerOf` function from the smart contract to retrieves the owners of each OVAL3 NFTs and stores them in the database.

`ListenOwners.ts` listens to the blockchain for the `Transfer` event of the smart contract and updates the database accordingly.

You need to run `GetOwners.ts` once to fill the database and run `ListenOwners.ts` in parallel to keep it up to date. The `GetOwners.ts` script will stop when it reaches the last NFT, and the `ListenOwners.ts` script will keep running until you stop it.

`ListenOwners.ts` will log the events it catches in `logs/transfers.log`.

Known issues:
- The scripts can interfere with each other while they are running at the same time if the token `GetOwners.ts` is currently processing is transferred. It's not very likely to happen, but it's possible. However the error is not very important, and will be fixed if the card is transferred again later.
- If `ListenOwners.ts` is stopped and restarted, it will not be able to catch up with the missed events. You will need to run `RecoverTransfer.ts` to fill the missing events in the database then start `LisListenOwners.ts` again.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- ROADMAP -->
## Roadmap

See the [open issues](https://github.com/ereynier/Oval3-Owners/issues) for a full list of proposed features (and known issues).

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- LICENSE -->
## License

Distributed under the MIT License. See `LICENSE.txt` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- CONTACT -->
## Contact

Estéban Reynier - [@EstebanReynier](https://twitter.com/EstebanReynier) - esteban@ereynier.me

Project Link: [https://github.com/ereynier/Oval3-Owners](https://github.com/ereynier/Oval3-Owners)

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- ACKNOWLEDGMENTS -->
## Acknowledgments

* [Oval3 game](https://oval3.game)
* [Viem.sh](https://viem.sh)
* [Prisma.io](https://www.prisma.io/)
* [PostgreSQL](https://www.postgresql.org/)
* [Typescript](https://www.typescriptlang.org/)

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[contributors-shield]: https://img.shields.io/github/contributors/ereynier/Oval3-Owners.svg?style=for-the-badge
[contributors-url]: https://github.com/ereynier/Oval3-Owners/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/ereynier/Oval3-Owners.svg?style=for-the-badge
[forks-url]: https://github.com/ereynier/Oval3-Owners/network/members
[stars-shield]: https://img.shields.io/github/stars/ereynier/Oval3-Owners.svg?style=for-the-badge
[stars-url]: https://github.com/ereynier/Oval3-Owners/stargazers
[issues-shield]: https://img.shields.io/github/issues/ereynier/Oval3-Owners.svg?style=for-the-badge
[issues-url]: https://github.com/ereynier/Oval3-Owners/issues
[license-shield]: https://img.shields.io/github/license/ereynier/Oval3-Owners.svg?style=for-the-badge
[license-url]: https://github.com/ereynier/Oval3-Owners/blob/master/LICENSE.txt
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/ereynier
[product-screenshot]: images/screenshot.png
[Next.js]: https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white
[Viem.sh]: https://img.shields.io/badge/Viem-000000?style=for-the-badge&logo=Ethereum&logoColor=EEEEEE
[Viem-url]: https://viem.sh/
[Prisma.io]: https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white
[Prisma-url]: https://www.prisma.io/
[Typescript]: https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white
[Typescript-url]: https://www.typescriptlang.org/
[PostgreSQL]: https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white
[PostgreSQL-url]: https://www.postgresql.org/
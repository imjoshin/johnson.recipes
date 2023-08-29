import * as React from "react";
import { graphql } from "gatsby";
import {
    Container,
    Section,
    FlexList,
    Box,
    Icon,
    Heading,
    Text,
    Space,
} from "./ui";

function Recipe(props) {
    return (
        <Box as="li" width="third" padding={4} paddingY={3}>
            {props.image && (
                <Icon
                    alt={props.image.alt}
                    image={props.image.gatsbyImageData}
                    size="small"
                />
            )}
            <Space size={2} />
            <Heading variant="subheadSmall">{props.title}</Heading>
            <Text>{props.description}</Text>
        </Box>
    );
}

export default function RecipeGroup(props) {
    return (
        <Section>
            <Container>
                <Box center>
                    {props.name && <Heading>{props.name}</Heading>}
                </Box>
                <Space size={3} />
                <FlexList gutter={3} variant="start" responsive wrap>
                    {props.recipes.map((recipe) => (
                        <Recipe key={recipe.id} {...recipe} />
                    ))}
                </FlexList>
            </Container>
        </Section>
    );
}

export const query = graphql`
  fragment RecipeGroupContent on RecipeGroup {
    id
    name
    recipes {
      id
      title
      description
      image {
        id
        gatsbyImageData
        alt
      }
    }
  }
`;
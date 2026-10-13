export interface CaseRecord {
  id: string;
  case_name: string;
  case_name_full: string;
  court: string;
  court_type: 'F' | 'FD' | 'FB' | 'FS';
  jurisdiction: string;
  date_filed: string; // YYYY-MM-DD
  citations: string[];
  citation_count: number;
  status: string;
  text: string;
}

export const COURT_TYPE_LABELS: Record<string, string> = {
  F: 'U.S. Courts of Appeals & Supreme Court',
  FD: 'U.S. District Courts',
  FB: 'U.S. Bankruptcy Courts',
  FS: 'Special Jurisdiction Courts',
};

export const CASES_DATABASE: CaseRecord[] = [
  {
    id: 'miranda-v-arizona',
    case_name: 'Miranda v. Arizona',
    case_name_full: 'Ernesto A. Miranda, Petitioner, v. State of Arizona',
    court: 'Supreme Court of the United States',
    court_type: 'F',
    jurisdiction: 'US Federal',
    date_filed: '1966-06-13',
    citations: ['384 U.S. 436', '86 S. Ct. 1602', '16 L. Ed. 2d 694'],
    citation_count: 3,
    status: 'Precedential',
    text: `MR. CHIEF JUSTICE WARREN delivered the opinion of the Court.

The cases before us raise questions which go to the roots of our concepts of American criminal jurisprudence: the restraints society must observe consistent with the Federal Constitution in prosecuting individuals for crime. More specifically, we deal with the admissibility of statements obtained from an individual who is subjected to custodial police interrogation and the necessity for procedures which assure that the individual is accorded his privilege under the Fifth Amendment to the Constitution not to be compelled to incriminate himself.

We dealt with certain phases of this problem recently in Escobedo v. Illinois, 378 U.S. 478 (1964). There, as in the four cases before us, law enforcement officials took the defendant into custody and interrogated him in a police station for the purpose of obtaining a confession. The police did not effectively advise him of his right to remain silent or of his right to consult with his attorney. Rather, they confronted him with an alleged accomplice who accused him of having perpetrated a murder. When the defendant said he wished to speak with his attorney, the police said he could not. His attorney arrived at police headquarters, but the police refused to permit him to speak with the defendant. We reversed the conviction.

Our holding will be spelled out with some specificity in the pages which follow, but, briefly stated, it is this: the prosecution may not use statements, whether exculpatory or inculpatory, stemming from custodial interrogation of the defendant unless it demonstrates the use of procedural safeguards effective to secure the privilege against self-incrimination. By custodial interrogation, we mean questioning initiated by law enforcement officers after a person has been taken into custody or otherwise deprived of his freedom of action in any significant way.

As for the procedural safeguards to be employed, unless other fully effective means are devised to inform accused persons of their right of silence and to assure a continuous opportunity to exercise it, the following measures are required. Prior to any questioning, the person must be warned that he has a right to remain silent, that any statement he does make may be used as evidence against him, and that he has a right to the presence of an attorney, either retained or appointed. The defendant may waive effectuation of these rights, provided the waiver is made voluntarily, knowingly and intelligently. If, however, he indicates in any manner and at any stage of the process that he wishes to consult with an attorney before speaking, there can be no questioning. Likewise, if the individual is alone and indicates in any manner that he does not wish to be interrogated, the police may not question him. The mere fact that he may have answered some questions or volunteered some statements on his own does not deprive him of the right to refrain from answering any further inquiries until he has consulted with an attorney and thereafter consents to be questioned.

The constitutional issue we decide in each of these cases is the admissibility of statements obtained from a defendant questioned while in custody or otherwise deprived of his freedom of action in any significant way. In each, the defendant was questioned by police officers, detectives, or a prosecuting attorney in a room in which he was cut off from the outside world. In none of these cases was the defendant given a full and effective warning of his rights at the outset of the interrogation process. In all the cases, the questioning elicited oral admissions, and in three of them, signed statements as well, which were admitted at their trials. They all thus share salient features — incommunicado interrogation of individuals in a police-dominated atmosphere, resulting in self-incriminating statements without full warnings of constitutional rights.

An understanding of the nature and setting of this in-custody interrogation is essential to our decisions today. The difficulty in depicting what transpires at such interrogations stems from the fact that, in this country, they have largely taken place incommunicado. From thick histories of police brutality, down to the modern manuals on interrogation techniques, the atmosphere carries its own badge of intimidation.

To summarize, we hold that when an individual is taken into custody or otherwise deprived of his freedom by the authorities in any significant way and is subjected to questioning, the privilege against self-incrimination is jeopardized. Procedural safeguards must be employed to protect the privilege, and unless other fully effective means are adopted to notify the person of his right of silence and to assure that the exercise of the right will be scrupulously honored, the following measures are required. He must be warned prior to any questioning that he has the right to remain silent, that anything he says can be used against him in a court of law, that he has the right to the presence of an attorney, and that if he cannot afford an attorney one will be appointed for him prior to any questioning if he so desires.

Opportunity to exercise these rights must be afforded to him throughout the interrogation. After such warnings have been given, and such opportunity afforded him, the individual may knowingly and intelligently waive these rights and agree to answer questions or make a statement. But unless and until such warnings and waiver are demonstrated by the prosecution at trial, no evidence obtained as a result of interrogation can be used against him.

Reversed and remanded.`,
  },
  {
    id: 'roe-v-wade',
    case_name: 'Roe v. Wade',
    case_name_full: 'Jane Roe, et al., Appellants, v. Henry Wade, District Attorney of Dallas County',
    court: 'Supreme Court of the United States',
    court_type: 'F',
    jurisdiction: 'US Federal',
    date_filed: '1973-01-22',
    citations: ['410 U.S. 113', '93 S. Ct. 705', '35 L. Ed. 2d 147'],
    citation_count: 3,
    status: 'Historical / Overruled',
    text: `MR. JUSTICE BLACKMUN delivered the opinion of the Court.

This Texas federal appeal and its Georgia companion, Doe v. Bolton, 410 U.S. 179, present constitutional challenges to state criminal abortion legislation. The Texas statutes under attack here are typical of those that have been in effect in many States for approximately a century. The Georgia statutes, in contrast, have a modern cast and are a adaptation of the American Law Institute's Model Penal Code.

We forthwith acknowledge our awareness of the sensitive and emotional nature of the abortion controversy, of the vigorous opposing views, even among physicians, and of the deep and seemingly absolute convictions that the subject inspires. One's philosophy, one's experiences, one's exposure to the raw edges of human existence, one's religious training, one's attitudes toward life and family and their values, and the moral standards one establishes and seeks to observe, are all likely to influence and to color one's thinking and conclusions about abortion.

The principal thrust of appellant's attack on the Texas statutes is that they improperly invade a right, said to be possessed by the pregnant woman, to choose to terminate her pregnancy. Appellant would discover this right in the concept of personal "liberty" embodied in the Fourteenth Amendment's Due Process Clause; or in personal, marital, familial, and sexual privacy said to be protected by the Bill of Rights or its penumbras, see Griswold v. Connecticut, 381 U.S. 479 (1965); Eisenstadt v. Baird, 405 U.S. 438 (1972); or among those rights reserved to the people by the Ninth Amendment.

The Constitution does not explicitly mention any right of privacy. In a line of decisions, however, going back perhaps as far as Union Pacific R. Co. v. Botsford, 141 U.S. 250, 251 (1891), the Court has recognized that a right of personal privacy, or a guarantee of certain areas or zones of privacy, does exist under the Constitution. In varying contexts, the Court or individual Justices have, indeed, found at least the roots of that right in the First Amendment; in the Fourth and Fifth Amendments; in the penumbras of the Bill of Rights; in the Ninth Amendment; or in the concept of liberty guaranteed by the first section of the Fourteenth Amendment.

This right of privacy, whether it be founded in the Fourteenth Amendment's concept of personal liberty and restrictions upon state action, as we feel it is, or, as the District Court determined, in the Ninth Amendment's reservation of rights to the people, is broad enough to encompass a woman's decision whether or not to terminate her pregnancy.

We, therefore, conclude that the right of personal privacy includes the abortion decision, but that this right is not unqualified, and must be considered against important state interests in regulation. State regulation protective of fetal life after viability thus has both logical and biological justifications. If the State is interested in protecting fetal life after viability, it may go so far as to proscribe abortion during that period, except when it is necessary to preserve the life or health of the mother.

Judgment affirmed in part and reversed in part.`,
  },
  {
    id: 'chevron-v-nrdc',
    case_name: 'Chevron U.S.A. Inc. v. Natural Resources Defense Council, Inc.',
    case_name_full: 'Chevron U.S.A. Inc., Petitioner v. Natural Resources Defense Council, Inc., et al.',
    court: 'Supreme Court of the United States',
    court_type: 'F',
    jurisdiction: 'US Federal',
    date_filed: '1984-06-25',
    citations: ['467 U.S. 837', '104 S. Ct. 2778', '81 L. Ed. 2d 694'],
    citation_count: 3,
    status: 'Overruled by Loper Bright',
    text: `JUSTICE STEVENS delivered the opinion of the Court.

In the Clean Air Act Amendments of 1977, Pub. L. 95-95, 91 Stat. 685, Congress enacted certain requirements applicable to States that had not achieved the national air quality standards established by the Environmental Protection Agency (EPA) pursuant to earlier legislation. The amended Clean Air Act required these "nonattainment" States to establish a permit program regulating "new or modified major stationary sources" of air pollution. Generally, a permit may not be issued which allows the construction or modification of major air pollution facilities without meeting stringent statutory standards.

The question presented by these cases is whether EPA's decision to allow States to treat all of the pollution-emitting devices within the same industrial grouping as though they were encased within a single "bubble" is based on a reasonable construction of the statutory term "stationary source."

When a court reviews an agency's construction of the statute which it administers, it is confronted with two questions. First, always, is the question whether Congress has directly spoken to the precise question at issue. If the intent of Congress is clear, that is the end of the matter; for the court, as well as the agency, must give effect to the unambiguously expressed intent of Congress. If, however, the court determines Congress has not directly addressed the precise question at issue, the court does not simply impose its own construction on the statute, as would be necessary in the absence of an administrative interpretation. Rather, if the statute is silent or ambiguous with respect to the specific issue, the question for the court is whether the agency's answer is based on a permissible construction of the statute.

The court need not conclude that the agency construction was the only one it permissibly could have adopted to uphold the construction, or even the reading the court would have reached if the question initially had arisen in a judicial proceeding.

Judges are not experts in the field, and are not part of either political branch of the Government. Courts must, in the first instance, reconcile competing political interests, but not on the basis of the judges' personal policy preferences. In contrast, an agency to which Congress has delegated policymaking responsibilities may, within the limits of that delegation, properly rely upon the incumbent administration's views of wise policy to inform its judgments.

We hold that the EPA's plantwide definition of "stationary source" was a permissible construction of the statute which seeks to balance environmental protections with industrial development. The judgment of the Court of Appeals is reversed.`,
  },
  {
    id: 'brown-v-board',
    case_name: 'Brown v. Board of Education of Topeka',
    case_name_full: 'Oliver Brown, et al. v. Board of Education of Topeka, Shawnee County, Kansas, et al.',
    court: 'Supreme Court of the United States',
    court_type: 'F',
    jurisdiction: 'US Federal',
    date_filed: '1954-05-17',
    citations: ['347 U.S. 483', '74 S. Ct. 686', '98 L. Ed. 873'],
    citation_count: 3,
    status: 'Precedential',
    text: `MR. CHIEF JUSTICE WARREN delivered the opinion of the Court.

These cases come to us from the States of Kansas, South Carolina, Virginia, and Delaware. They are premised on different facts and different local conditions, but a common legal question justifies their consideration together in this consolidated opinion.

In each of the cases, minors of the African-American race, through their legal representatives, seek the aid of the courts in obtaining admission to the public schools of their respective communities on a nonsegregated basis. In each instance, they had been denied admission to schools attended by white children under laws requiring or permitting segregation according to race. This segregation was alleged to deprive the plaintiffs of the equal protection of the laws under the Fourteenth Amendment.

The plaintiffs contend that segregated public schools are not "equal" and cannot be made "equal," and that hence they are deprived of the equal protection of the laws. Because of the obvious importance of the question presented, the Court heard argument in the 1952 Term, and ordered reargument this Term on certain questions concerning the adoption of the Fourteenth Amendment.

Reargument was largely devoted to the circumstances surrounding the adoption of the Fourteenth Amendment in 1868. It covered exhaustively consideration of the Amendment in Congress, ratification by the states, then existing practices in racial segregation, and the views of proponents and opponents of the Amendment. This discussion and our own investigation convince us that, although these sources cast some light, it is not enough to resolve the problem with which we are faced. At best, they are inconclusive.

In approaching this problem, we cannot turn the clock back to 1868, when the Amendment was adopted, or even to 1896, when Plessy v. Ferguson was written. We must consider public education in the light of its full development and its present place in American life throughout the Nation. Only in this way can it be determined if segregation in public schools deprives these plaintiffs of the equal protection of the laws.

Today, education is perhaps the most important function of state and local governments. Compulsory school attendance laws and the great expenditures for education both demonstrate our recognition of the importance of education to our democratic society. It is required in the performance of our most basic public responsibilities, even service in the armed forces. It is the very foundation of good citizenship.

We come then to the question presented: Does segregation of children in public schools solely on the basis of race, even though the physical facilities and other "tangible" factors may be equal, deprive the children of the minority group of equal educational opportunities? We believe that it does.

To separate them from others of similar age and qualifications solely because of their race generates a feeling of inferiority as to their status in the community that may affect their hearts and minds in a way unlikely ever to be undone.

We conclude that, in the field of public education, the doctrine of "separate but equal" has no place. Separate educational facilities are inherently unequal. Therefore, we hold that the plaintiffs and others similarly situated for whom the actions have been brought are, by reason of the segregation complained of, deprived of the equal protection of the laws guaranteed by the Fourteenth Amendment.`,
  },
  {
    id: 'gideon-v-wainwright',
    case_name: 'Gideon v. Wainwright',
    case_name_full: 'Clarence Earl Gideon, Petitioner, v. Louie L. Wainwright, Director, Division of Corrections',
    court: 'Supreme Court of the United States',
    court_type: 'F',
    jurisdiction: 'US Federal',
    date_filed: '1963-03-18',
    citations: ['372 U.S. 335', '83 S. Ct. 792', '9 L. Ed. 2d 799'],
    citation_count: 3,
    status: 'Precedential',
    text: `MR. JUSTICE BLACK delivered the opinion of the Court.

Petitioner was charged in a Florida state court with having broken and entered a poolroom with intent to commit a misdemeanor. This offense is a felony under Florida law. Appearing in court without funds and without a lawyer, petitioner asked the court to appoint counsel for him, whereupon the following colloquy took place:

"The COURT: Mr. Gideon, I am sorry, but I cannot appoint Counsel to represent you in this case. Under the laws of the State of Florida, the only time the Court can appoint Counsel to represent a Defendant is when that person is charged with a capital offense. I am sorry, but I will have to deny your request to appoint Counsel to defend you."

Put to trial before a jury, Gideon conducted his defense about as well as could be expected from a layman. He made an opening statement to the jury, cross-examined the State's witnesses, presented witnesses in his own defense, conducted his own examination, and made a short argument "emphasizing his innocence to the charge." The jury returned a verdict of guilty, and petitioner was sentenced to serve five years in the state prison.

Since 1942, when Betts v. Brady, 316 U.S. 455, was decided by a divided Court, the problem of a defendant's federal constitutional right to counsel in a state court has been a continuing source of controversy and litigation in both state and federal courts. To give this problem another review here, we granted certiorari. Since Gideon was proceeding in forma pauperis, we appointed counsel to represent him and requested counsel to discuss this question: "Should this Court's holding in Betts v. Brady be reconsidered?"

We think the Court in Betts had ample precedent for acknowledging that those guarantees of the Bill of Rights which are fundamental safeguards of liberty immune from federal abridgment are equally protected against state invasion by the Due Process Clause of the Fourteenth Amendment. This same principle was recognized, explained, and applied in Powell v. Alabama, 287 U.S. 45 (1932).

That government hires lawyers to prosecute and defendants who have the money hire lawyers to defend are the strongest indications of the widespread belief that lawyers in criminal courts are necessities, not luxuries. The right of one charged with crime to counsel may not be deemed fundamental and essential to fair trials in some countries, but it is in ours. From the very beginning, our state and national constitutions and laws have laid great emphasis on procedural and substantive safeguards designed to assure fair trials before impartial tribunals in which every defendant stands equal before the law. This noble ideal cannot be realized if the poor man charged with crime has to face his accusers without a lawyer to assist him.

The Court in Betts v. Brady departed from the sound wisdom upon which the Court's holding in Powell v. Alabama rested. Florida, supported by two other States, has asked us not to overrule Betts v. Brady. Twenty-two States, as friends of the Court, argue that Betts was "an anachronism when handed down" and that it should now be overruled. We agree.

The judgment is reversed and the cause is remanded to the Supreme Court of Florida for further action not inconsistent with this opinion.`,
  },
  {
    id: 'citizens-united-v-fec',
    case_name: 'Citizens United v. Federal Election Commission',
    case_name_full: 'Citizens United, Appellant v. Federal Election Commission',
    court: 'Supreme Court of the United States',
    court_type: 'F',
    jurisdiction: 'US Federal',
    date_filed: '2010-01-21',
    citations: ['558 U.S. 310', '130 S. Ct. 876', '175 L. Ed. 2d 753'],
    citation_count: 3,
    status: 'Precedential',
    text: `JUSTICE KENNEDY delivered the opinion of the Court.

Federal law prohibits corporations and unions from using their general treasury funds to make independent expenditures for speech defined as an "electioneering communication" or for speech expressly advocating the election or defeat of a candidate. 2 U.S.C. § 441b. Limits on electioneering communications were upheld in McConnell v. Federal Election Comm'n, 540 U.S. 93 (2003). The restraint on speech in a theatrical feature-length documentary produced by Citizens United, entitled Hillary: The Movie, brings the constitutionality of that statute here for decision.

In January 2008, Citizens United released a film entitled Hillary: The Movie. We consider whether § 441b applies to the film, and if so, whether the statutory restriction on independent expenditures violates the First Amendment.

The First Amendment provides that "Congress shall make no law ... abridging the freedom of speech." Speech is an essential mechanism of democracy, for it is the means to hold officials accountable to the people. The right of citizens to inquire, to hear, to speak, and to use information to reach consensus is a precondition to enlightened self-government and a necessary means to protect it.

The Court has recognized that First Amendment protection extends to corporations. This protection has been extended by explicit holdings to the context of political speech. Under the rationale of these precedents, political speech does not lose First Amendment protection simply because its source is a corporation. The identity of the speaker is not a decisive factor in determining whether speech has constitutional protection.

Government may not suppress speech on the ground that the speaker has too much money or is too successful in its business affairs. Austin's antidistortion rationale would produce the dangerous, and unacceptable, result that Congress could ban political speech of media corporations, including book publishers and television news commentators.

We return to the principle established in Buckley and First Nat. Bank of Boston v. Bellotti that the Government may not restrict political speech based on the speaker's corporate identity. No sufficient governmental interest justifies limits on the political speech of nonprofit or for-profit corporations.

Section 441b's restrictions on independent expenditures violate the First Amendment. The judgment of the District Court is reversed with respect to the constitutionality of 2 U.S.C. § 441b's restrictions on corporate independent expenditures.`,
  },
  {
    id: 'dc-v-heller',
    case_name: 'District of Columbia v. Heller',
    case_name_full: 'District of Columbia, et al., Petitioners v. Dick Anthony Heller',
    court: 'Supreme Court of the United States',
    court_type: 'F',
    jurisdiction: 'US Federal',
    date_filed: '2008-06-26',
    citations: ['554 U.S. 570', '128 S. Ct. 2783', '171 L. Ed. 2d 637'],
    citation_count: 3,
    status: 'Precedential',
    text: `JUSTICE SCALIA delivered the opinion of the Court.

We consider whether a District of Columbia prohibition on the possession of usable handguns in the home violates the Second Amendment to the Constitution.

The Second Amendment provides: "A well regulated Militia, being necessary to the security of a free State, the right of the people to keep and bear Arms, shall not be infringed." In interpreting this text, we are guided by the principle that "The Constitution was written to be understood by the voters; its words and phrases were used in their normal and ordinary as distinguished from technical meaning."

The two sides in this case have set out very different interpretations of the Amendment. Petitioners and today's dissenting Justices believe that it protects only the right to possess and carry a firearm in connection with militia service. Respondent argues that it protects an individual right to possess a firearm unconnected with service in a militia, and to use that arm for traditionally lawful purposes, such as self-defense within the home.

The Amendment's prefatory clause announces a purpose, but does not limit or expand the scope of the operative clause. "The right of the people to keep and bear Arms" refers to an individual right possessed by all Americans, just as "the right of the people peaceably to assemble" in the First Amendment and "the right of the people to be secure" in the Fourth Amendment refer to rights of individuals.

Putting all of these textual elements together, we find that they guarantee the individual right to possess and carry weapons in case of confrontation. This meaning is strongly confirmed by the historical background of the Second Amendment. We look to history because it has always been widely understood that the Second Amendment, like the First and Fourth Amendments, codified a pre-existing right.

The handgun ban amounts to a prohibition of an entire class of "arms" that is overwhelmingly chosen by American society for that lawful purpose. The prohibition extends, moreover, to the home, where the need for defense of self, family, and property is most acute. Under any of the standards of scrutiny that we have applied to enumerated constitutional rights, banning from the home the most preferred firearm in the nation to keep and use for protection of one's home and family would fail constitutional muster.

We affirm the judgment of the Court of Appeals for the District of Columbia Circuit.`,
  },
  {
    id: 'marbury-v-madison',
    case_name: 'Marbury v. Madison',
    case_name_full: 'William Marbury v. James Madison, Secretary of State of the United States',
    court: 'Supreme Court of the United States',
    court_type: 'F',
    jurisdiction: 'US Federal',
    date_filed: '1803-02-24',
    citations: ['5 U.S. 137', '1 Cranch 137', '2 L. Ed. 60'],
    citation_count: 3,
    status: 'Precedential',
    text: `MR. CHIEF JUSTICE MARSHALL delivered the opinion of the Court.

At the last term on the affidavits then read and filed with the clerk, a rule was granted in this case, requiring the Secretary of State to show cause why a mandamus should not issue, directing him to deliver to William Marbury his commission as a justice of the peace for the county of Washington, in the district of Columbia.

No cause has been shown, and the present motion is for a mandamus. The peculiar delicacy of this case, the novelty of some of its circumstances, and the real difficulty attending the points which occur in it, require a complete exposition of the principles on which the opinion to be given by the court is founded.

This exposition has been made, and the following opinion is the result of that examination:

1st. Has the applicant a right to the commission he demands?
2dly. If he has a right, and that right has been violated, do the laws of his country afford him a remedy?
3dly. If they do afford him a remedy, is it a mandamus issuing from this court?

It is emphatically the province and duty of the judicial department to say what the law is. Those who apply the rule to particular cases, must of necessity expound and interpret that rule. If two laws conflict with each other, the courts must decide on the operation of each.

So if a law be in opposition to the constitution; if both the law and the constitution apply to a particular case, so that the court must either decide that case conformably to the law, disregarding the constitution; or conformably to the constitution, disregarding the law; the court must determine which of these conflicting rules governs the case. This is of the very essence of judicial duty.

If, then, the courts are to regard the constitution, and the constitution is superior to any ordinary act of the legislature, the constitution, and not such ordinary act, must govern the case to which they both apply.

Those, then, who controvert the principle that the constitution is to be considered, in court, as a paramount law, are reduced to the necessity of maintaining that courts must close their eyes on the constitution, and see only the law. This doctrine would subvert the very foundation of all written constitutions.

The authority, therefore, given to the Supreme Court, by the act establishing the judicial courts of the United States, to issue writs of mandamus to public officers, appears not to be warranted by the constitution; and it becomes necessary to inquire whether a jurisdiction, so conferred, can be exercised.

The rule must be discharged.`,
  },
  {
    id: 'loving-v-virginia',
    case_name: 'Loving v. Virginia',
    case_name_full: 'Richard Perry Loving, et ux., Appellants, v. Commonwealth of Virginia',
    court: 'Supreme Court of the United States',
    court_type: 'F',
    jurisdiction: 'US Federal',
    date_filed: '1967-06-12',
    citations: ['388 U.S. 1', '87 S. Ct. 1817', '18 L. Ed. 2d 1010'],
    citation_count: 3,
    status: 'Precedential',
    text: `MR. CHIEF JUSTICE WARREN delivered the opinion of the Court.

This issue presents a constitutional question often mooted in this Court but never yet decided: whether a statutory scheme adopted by the State of Virginia to prevent marriages between persons solely on the basis of racial classifications violates the Equal Protection and Due Process Clauses of the Fourteenth Amendment. For reasons which seem to us to reflect the central meaning of those constitutional provisions, we hold that these statutes cannot stand consistently with the Fourteenth Amendment.

In June 1958, two residents of Virginia, Mildred Jeter, an African-American and Native American woman, and Richard Loving, a white man, were married in the District of Columbia pursuant to its laws. Shortly thereafter, the Lovings returned to Virginia and established their marital abode in Caroline County. At the October Term, 1958, of the Circuit Court of Caroline County, a grand jury issued an indictment charging the Lovings with violating Virginia's ban on interracial marriages. On January 6, 1959, the Lovings pleaded guilty to the charge and were sentenced to one year in jail; however, the trial judge suspended the sentence for a period of 25 years on the condition that the Lovings leave the State and not return to Virginia together for 25 years.

There is no patently legitimate overriding purpose independent of invidious racial discrimination which justifies this classification. The fact that Virginia prohibits only interracial marriages involving white persons demonstrates that the racial classifications must stand on their own justification, as measures designed to maintain White Supremacy.

Marriage is one of the "basic civil rights of man," fundamental to our very existence and survival. To deny this fundamental freedom on so unsupportable a basis as the racial classifications embodied in these statutes, classifications so directly subversive of the principle of equality at the heart of the Fourteenth Amendment, is surely to deprive all the State's citizens of liberty without due process of law. The Fourteenth Amendment requires that the freedom of choice to marry not be restricted by invidious racial discriminations. Under our Constitution, the freedom to marry, or not marry, a person of another race resides with the individual and cannot be infringed by the State.

These convictions must be reversed. It is so ordered.`,
  },
  {
    id: 'us-v-nixon',
    case_name: 'United States v. Nixon',
    case_name_full: 'United States, Petitioner v. Richard M. Nixon, President of the United States, et al.',
    court: 'Supreme Court of the United States',
    court_type: 'F',
    jurisdiction: 'US Federal',
    date_filed: '1974-07-24',
    citations: ['418 U.S. 683', '94 S. Ct. 3090', '41 L. Ed. 2d 1039'],
    citation_count: 3,
    status: 'Precedential',
    text: `MR. CHIEF JUSTICE BURGER delivered the opinion of the Court.

This litigation presents for review the denial of a motion, filed in the District Court on behalf of the President of the United States, in the case of United States v. Mitchell et al., to quash a third-party subpoena duces tecum issued by the United States District Court for the District of Columbia, pursuant to Fed. Rule Crim. Proc. 17 (c). The subpoena directed the President to produce certain tape recordings and documents relating to his conversations with aides and advisers.

The President claimed an absolute executive privilege of confidentiality for all presidential communications, asserting that the separation of powers precludes judicial review of a presidential claim of privilege.

In support of his claim of absolute privilege, the President's counsel urges two grounds, one of which is common to all governments and one of which is peculiar to our system of separated powers. The first ground is the valid need for protection of communications between high Government officials and those who advise and assist them in the performance of their manifold duties; the importance of this confidentiality is too plain to require further discussion. Human experience teaches that those who expect public dissemination of their remarks may well temper candor with a concern for appearances and for their own interests to the detriment of the decisionmaking process.

The second ground asserted by the President's counsel in support of the claim of absolute privilege rests on the doctrine of separation of powers. Here it is argued that the independence of the Executive Branch within its own sphere insulates a President from a judicial subpoena in an ongoing criminal prosecution.

However, neither the doctrine of separation of powers, nor the need for confidentiality of high-level communications, without more, can sustain an absolute, unqualified Presidential privilege of immunity from judicial process under all circumstances. The impediment that an absolute, unqualified privilege would place in the way of the primary constitutional duty of the Judicial Branch to do justice in criminal prosecutions would plainly conflict with the function of the courts under Art. III.

To read the Art. II powers of the President as providing an absolute privilege as against a subpoena essential to enforcement of criminal statutes on no more than a generalized claim of the public interest in confidentiality of nonmilitary and nondiplomatic discussions would upset the constitutional balance of "a workable government" and gravely impair the role of the courts under Art. III.

We conclude that when the ground for asserting privilege as to subpoenaed materials sought for use in a criminal trial is based only on the generalized interest in confidentiality, it cannot prevail over the fundamental demands of due process of law in the fair administration of criminal justice. The generalized assertion of privilege must yield to the demonstrated, specific need for evidence in a pending criminal trial.

Affirmed.`,
  },
  {
    id: 'riley-v-california',
    case_name: 'Riley v. California',
    case_name_full: 'David Leon Riley, Petitioner v. California',
    court: 'Supreme Court of the United States',
    court_type: 'F',
    jurisdiction: 'US Federal',
    date_filed: '2014-06-25',
    citations: ['573 U.S. 373', '134 S. Ct. 2473', '189 L. Ed. 2d 430'],
    citation_count: 3,
    status: 'Precedential',
    text: `CHIEF JUSTICE ROBERTS delivered the opinion of the Court.

These two cases raise a common question: whether the police may, without a warrant, search digital information on a cell phone seized from an individual who has been arrested.

The Fourth Amendment provides that "The right of the people to be secure in their persons, houses, papers, and effects, against unreasonable searches and seizures, shall not be violated, and no Warrants shall issue, but upon probable cause, supported by Oath or affirmation, and particularly describing the place to be searched, and the persons or things to be seized."

As the text makes clear, "the ultimate touchstone of the Fourth Amendment is reasonableness." Our cases have determined that as a general matter, warrantless searches are per se unreasonable under the Fourth Amendment — subject only to a few specifically established and well-delineated exceptions. One such exception allows the search of a person and the area within his immediate control incident to a lawful arrest.

Modern cell phones are in no way comparable to traditional physical items found on an arrestee's person, such as a wallet or a pack of cigarettes. A cell phone search typically exposes to the government far more than the most exhaustive search of a house: A phone not only contains in digital form many sensitive records previously found in the home; it also contains a broad array of private information never found in a home in any form — unless the phone is there.

Cell phones differ in both a quantitative and a qualitative sense from other objects that might be kept on an arrestee's person. The term "cell phone" is itself misleading shorthand; many of these devices are in fact minicomputers that also happen to have the capacity to be used as a telephone. They could just as easily be called cameras, video players, rolodexes, calendars, tape recorders, libraries, diaries, albums, televisions, maps, or newspapers. One of the most notable distinguishing features of modern cell phones is their immense storage capacity.

Modern cell phones, as a category, implicate privacy concerns far beyond those implicated by the search of a cigarette pack, a wallet, or a purse. A conclusion that inspecting the contents of an arrestee's pockets does not much increase the indignity of arrest cannot be extended to a search of the digital contents of his cell phone.

Our answer to the question of what police must do before searching a cell phone seized incident to an arrest is accordingly simple: get a warrant.

The judgment of the California Court of Appeal is reversed.`,
  },
  {
    id: 'katz-v-us',
    case_name: 'Katz v. United States',
    case_name_full: 'Charles Katz, Petitioner, v. United States',
    court: 'Supreme Court of the United States',
    court_type: 'F',
    jurisdiction: 'US Federal',
    date_filed: '1967-12-18',
    citations: ['389 U.S. 347', '88 S. Ct. 507', '19 L. Ed. 2d 576'],
    citation_count: 3,
    status: 'Precedential',
    text: `MR. JUSTICE STEWART delivered the opinion of the Court.

The petitioner was convicted in the District Court for the Southern District of California under an eight-count indictment charging him with transmitting wagering information by telephone from Los Angeles to Miami and Boston, in violation of a federal statute. At his trial the Government was permitted, over the petitioner's objection, to introduce evidence of the petitioner's end of telephone conversations, overheard by FBI agents who had attached an electronic listening and recording device to the outside of the public telephone booth from which he had placed his calls.

The petitioner has phrased the questions presented as follows:
"A. Whether a publicly accessible telephone booth is a constitutionally protected area so that evidence obtained by attaching an electronic listening recording device to the top of such a booth is obtained in violation of the Fourth Amendment."
"B. Whether physical penetration of a constitutionally protected area is necessary before a search and seizure can be said to be violative of the Fourth Amendment."

We decline to adopt this formulation of the issues. In the first place, the correct solution of Fourth Amendment problems is not necessarily promoted by incantation of the phrase "constitutionally protected area." Secondly, the Fourth Amendment cannot be translated into a general constitutional "right to privacy."

What a person knowingly exposes to the public, even in his own home or office, is not a subject of Fourth Amendment protection. But what he seeks to preserve as private, even in an area accessible to the public, may be constitutionally protected.

The Government stresses the fact that the telephone booth from which the petitioner made his calls was constructed partly of glass, so that he was as visible after he entered it as he would have been if he had remained outside. But what he sought to exclude when he entered the booth was not the intruding eye — it was the uninvited ear. He did not shed his right to do so simply because he made his calls from a place where he might be seen.

The Government's activities in electronically listening to and recording the petitioner's words violated the privacy upon which he justifiably relied while using the telephone booth and thus constituted a "search and seizure" within the meaning of the Fourth Amendment. The fact that the electronic device employed to achieve that end did not happen to penetrate the wall of the booth can have no constitutional significance.

Once this much is acknowledged, and once it is recognized that the Fourth Amendment protects people — and not simply "areas" — against unreasonable searches and seizures, it becomes clear that the reach of that Amendment cannot turn upon the presence or absence of a physical intrusion into any given enclosure.

Judgment reversed.`,
  },
  {
    id: 'tinker-v-des-moines',
    case_name: 'Tinker v. Des Moines Independent Community School District',
    case_name_full: 'John F. Tinker and Mary Beth Tinker, Minors, et al., Petitioners, v. Des Moines Independent Community School District et al.',
    court: 'Supreme Court of the United States',
    court_type: 'F',
    jurisdiction: 'US Federal',
    date_filed: '1969-02-24',
    citations: ['393 U.S. 503', '89 S. Ct. 733', '21 L. Ed. 2d 731'],
    citation_count: 3,
    status: 'Precedential',
    text: `MR. JUSTICE FORTAS delivered the opinion of the Court.

Petitioner John F. Tinker, 15 years old, and petitioner Christopher Eckhardt, 16 years old, attended high schools in Des Moines, Iowa. Petitioner Mary Beth Tinker, John's sister, was a 13-year-old student in junior high school.

In December 1965, a group of adults and students in Des Moines held a meeting at the Eckhardt home. The group determined to publicize their objections to the hostilities in Vietnam and their support for a truce by wearing black armbands during the holiday season and by fasting on December 16 and New Year's Eve. Petitioners and their parents had previously engaged in similar activities, and they decided to participate in the program.

The principals of the Des Moines schools became aware of the plan to wear armbands. On December 14, 1965, the principals met and adopted a policy that any student wearing an armband to school would be asked to remove it, and if he refused he would be suspended until he returned without the armband. Petitioners were aware of the regulation that the school authorities adopted.

On December 16, Mary Beth and Christopher wore black armbands to their schools. John Tinker wore his armband the next day. They were all sent home and suspended from school until they would come back without their armbands. They did not return to school until after the planned period for wearing armbands had expired — that is, until after New Year's Day.

First Amendment rights, applied in light of the special characteristics of the school environment, are available to teachers and students. It can hardly be argued that either students or teachers shed their constitutional rights to freedom of speech or expression at the schoolhouse gate. This has been the unmistakable holding of this Court for almost 50 years.

In order for the State in the person of school officials to justify prohibition of a particular expression of opinion, it must be able to show that its action was caused by something more than a mere desire to avoid the discomfort and unpleasantness that always accompany an unpopular viewpoint. Certainly where there is no finding and no showing that engaging in the forbidden conduct would "materially and substantially interfere with the requirements of appropriate discipline in the operation of the school," the prohibition cannot be sustained.

Reversed and remanded.`,
  },
  {
    id: 'second-circuit-sec-v-cuban',
    case_name: 'Securities and Exchange Commission v. Cuban',
    case_name_full: 'Securities and Exchange Commission v. Mark Cuban',
    court: 'U.S. Court of Appeals for the Fifth Circuit',
    court_type: 'F',
    jurisdiction: 'Fifth Circuit',
    date_filed: '2010-09-21',
    citations: ['620 F.3d 551', '2010 U.S. App. LEXIS 19612'],
    citation_count: 2,
    status: 'Precedential',
    text: `Before DAVIS, WIENER, and ELROD, Circuit Judges.

W. EUGENE DAVIS, Circuit Judge:

The Securities and Exchange Commission ("SEC") appeals the dismissal with prejudice of its civil insider trading action against Mark Cuban under Section 17(a) of the Securities Act of 1933, Section 10(b) of the Securities Exchange Act of 1934, and Rule 10b-5 thereunder. The district court concluded that the complaint failed to allege that Cuban agreed not to trade on confidential information he received from the chief executive officer of Mamma.com Inc., and therefore dismissed the complaint for failure to state a claim.

Under the misappropriation theory of insider trading, a person commits fraud in connection with a securities transaction, and thereby violates § 10(b) and Rule 10b-5, when he misappropriates confidential information for securities trading purposes, in breach of a duty owed to the source of the information. United States v. O'Hagan, 521 U.S. 642, 652 (1997).

The SEC alleges that Cuban was the largest known shareholder in Mamma.com, holding a 6.3% stake. The company's CEO called Cuban and told him he had confidential information to convey. Cuban agreed that he would keep the information confidential. The CEO then informed Cuban that the company planned a private investment in public equity (PIPE) offering, which would dilute existing shareholders. Cuban reacted angrily, stating that he would sell his shares. Within hours of the conversation, Cuban directed his broker to sell his entire stake before the public announcement of the PIPE.

We conclude that the allegations in the SEC's complaint, taken as true at this stage of the litigation, plausibly allege that Cuban entered into an agreement to keep the information confidential, and that a duty not to trade arose from the circumstances of the disclosure. Because the agreement may plausibly be understood as an agreement not to use the information for personal gain, the district court erred in dismissing the complaint on the pleadings.

REVERSED and REMANDED for further proceedings.`,
  },
  {
    id: 'dc-circuit-halbig-v-burwell',
    case_name: 'Halbig v. Burwell',
    case_name_full: 'Jacqueline Halbig, et al., Appellants v. Sylvia Mathews Burwell, Secretary of Health and Human Services, et al.',
    court: 'U.S. Court of Appeals for the District of Columbia Circuit',
    court_type: 'F',
    jurisdiction: 'D.C. Circuit',
    date_filed: '2014-07-22',
    citations: ['758 F.3d 390', '411 U.S. App. D.C. 147'],
    citation_count: 2,
    status: 'Vacated en banc',
    text: `Before GRIFFITH and KAVANAUGH, Circuit Judges, and EDWARDS, Senior Circuit Judge.

GRIFFITH, Circuit Judge:

Under the Patient Protection and Affordable Care Act (ACA), the federal government provides tax credits to help lower-income individuals purchase health insurance on newly created health insurance exchanges. Section 36B of the Internal Revenue Code, enacted as part of the ACA, provides that tax credits shall be available to individuals who enroll in insurance through an "Exchange established by the State under [42 U.S.C. § 18031]."

The Internal Revenue Service promulgated a regulation making tax credits available not only on state-established exchanges, but also on exchanges established by the federal government under Section 1321 of the Act. Appellants contend that the IRS rule exceeds the statutory authorization and conflicts with the plain text of Section 36B.

The text of Section 36B is plain and unambiguous. An exchange established by the federal government is not an "Exchange established by the State." Congress enacted a specific definition and chose particular language. Because the statute clearly restricts subsidies to state-established exchanges, the IRS regulation cannot stand under step one of Chevron.

We recognize that this conclusion may have significant consequences for the operation of the Affordable Care Act in states that elected not to establish exchanges. But the role of this court is to interpret the law as written by Congress, not to rewrite statutory terms to achieve what we or the administrative agency may deem a preferable policy outcome.

Reversed.`,
  },
  {
    id: 'apple-v-samsung-district',
    case_name: 'Apple Inc. v. Samsung Electronics Co., Ltd.',
    case_name_full: 'Apple Inc., a California corporation, Plaintiff, v. Samsung Electronics Co., Ltd., a Korean corporation, et al., Defendants',
    court: 'U.S. District Court for the Northern District of California',
    court_type: 'FD',
    jurisdiction: 'N.D. Cal.',
    date_filed: '2012-08-24',
    citations: ['888 F. Supp. 2d 976', '2012 U.S. Dist. LEXIS 120593'],
    citation_count: 2,
    status: 'Precedential / Final Judgment',
    text: `LUCY H. KOH, United States District Judge:

This patent infringement and trade dress litigation between Apple Inc. and Samsung Electronics Co., Ltd., et al., was tried before a jury of nine citizens from July 30, 2012 to August 21, 2012. After four days of deliberation, the jury returned a verdict finding that multiple Samsung smartphones and tablet products willfully infringed several of Apple's utility and design patents, as well as diluting Apple's trade dress. The jury awarded Apple $1.049 billion in damages.

Before the Court are the parties' post-trial motions under Federal Rules of Civil Procedure 50(b) and 59, including Samsung's motion for judgment as a matter of law, motion for a new trial, and Apple's motion for permanent injunctive relief and supplemental damages.

I. BACKGROUND
Apple introduced the original iPhone in January 2007. Prior to the iPhone's introduction, mobile phones predominantly featured physical hardware keyboards, styluses, and small display screens. The iPhone introduced a multi-touch capacitive screen, a minimalist rectangular front face with rounded corners, and a distinctive graphical user interface featuring a grid of colorful icons on a black background.

Samsung is one of the world's largest consumer electronics manufacturers. Internal Samsung documents admitted into evidence at trial demonstrated that following the release of the iPhone, Samsung executives undertook a coordinated effort to benchmark and emulate Apple's industrial and software designs.

II. STANDARD OF REVIEW
Judgment as a matter of law under Rule 50(b) is appropriate only if the evidence, viewed in the light most favorable to the nonmoving party, permits only one reasonable conclusion, and that conclusion is contrary to the jury's verdict. Pavao v. Pagay, 307 F.3d 915, 918 (9th Cir. 2002).

III. DESIGN PATENT INFRINGEMENT
The jury found that Samsung infringed Apple's D618,677, D593,087, and D604,305 patents. Under the ordinary observer test articulated in Gorham Co. v. White, 81 U.S. 511 (1871) and reaffirmed in Egyptian Goddess, Inc. v. Swisa, Inc., 543 F.3d 665 (Fed. Cir. 2008), design patent infringement is established if an ordinary observer, giving such attention as a purchaser usually gives, would find the two designs substantially the same. Substantial evidence supported the jury's finding of design patent infringement across the accused products.

The Court finds that the jury was properly instructed on all counts. Samsung's motion for judgment as a matter of law is DENIED in relevant part, subject to remittitur on specified individual phone models.`,
  },
  {
    id: 'us-v-microsoft-district',
    case_name: 'United States v. Microsoft Corporation',
    case_name_full: 'United States of America, Plaintiff, v. Microsoft Corporation, Defendant',
    court: 'U.S. District Court for the District of Columbia',
    court_type: 'FD',
    jurisdiction: 'D.D.C.',
    date_filed: '2000-04-03',
    citations: ['87 F. Supp. 2d 30', '2000-1 Trade Cas. (CCH) P72,839'],
    citation_count: 2,
    status: 'Precedential / Modified on Appeal',
    text: `THOMAS PENFIELD JACKSON, United States District Judge:

The United States and nineteen individual states bring these antitrust actions against Microsoft Corporation under Sections 1 and 2 of the Sherman Act, 15 U.S.C. §§ 1, 2. The plaintiffs allege that Microsoft unlawfully maintained a monopoly in the market for Intel-compatible PC operating systems, attempted to monopolize the market for Web browsers, and bundled its Web browser, Internet Explorer, with its Windows operating system.

I. CONCLUSIONS OF LAW
Based on the extensive findings of fact previously entered by the Court on November 5, 1999 (see 84 F. Supp. 2d 9), the Court reaches the following conclusions of law:

First, Microsoft maintained its monopoly power in the licensing of software operating systems for Intel-compatible personal computers by anti-competitive means, in violation of § 2 of the Sherman Act. Microsoft achieved this through a series of exclusionary and predatory contractual restrictions placed on computer hardware manufacturers (OEMs), internet access providers, and independent software vendors, designed specifically to prevent the distribution and adoption of Netscape Navigator and Sun Microsystems' Java technology, which threatened to serve as middleware platforms.

Second, Microsoft attempted to monopolize the market for Web browsers through an unlawful campaign aimed at extinguishing Netscape as a competitive browser threat, also in violation of § 2.

Third, Microsoft unlawfully tied its Internet Explorer Web browser to its Windows operating system by contractual restrictions and technological bundling, in violation of § 1 of the Sherman Act. By refusing to license Windows without Internet Explorer and designing the code to prevent uninstallation, Microsoft denied consumers choice and foreclosed competing browser developers from the principal channel of distribution.

Remedies will be addressed in a separate proceeding following further briefing.`,
  },
  {
    id: 'ftc-v-qualcomm-district',
    case_name: 'Federal Trade Commission v. Qualcomm Inc.',
    case_name_full: 'Federal Trade Commission, Plaintiff, v. Qualcomm Incorporated, a Delaware corporation, Defendant',
    court: 'U.S. District Court for the Northern District of California',
    court_type: 'FD',
    jurisdiction: 'N.D. Cal.',
    date_filed: '2019-05-21',
    citations: ['411 F. Supp. 3d 658', '2019 U.S. Dist. LEXIS 85731'],
    citation_count: 2,
    status: 'Reversed on Appeal (969 F.3d 974)',
    text: `LUCY H. KOH, District Judge:

Plaintiff Federal Trade Commission ("FTC") brings this antitrust action under Section 5(a) of the Federal Trade Commission Act, 15 U.S.C. § 45(a), against Defendant Qualcomm Incorporated. The FTC alleges that Qualcomm has unlawfully maintained monopoly power in the markets for CDMA and premium LTE modem chips through anticompetitive licensing practices, including a "no license, no chips" policy, refusing to license competitors, and entering into exclusive dealing arrangements.

Following a ten-day bench trial, having considered the testimony of witnesses, hundreds of trial exhibits, and the parties' pre- and post-trial briefs, the Court finds that Qualcomm has engaged in anticompetitive conduct that violates Section 5 of the FTC Act.

Qualcomm's practices have harmed competition in two ways: first, Qualcomm's "no license, no chips" policy coerces original equipment manufacturers (OEMs) into accepting unreasonably high patent royalty rates under threat of cutting off essential modem chip supplies; second, Qualcomm's refusal to license its standard-essential patents (SEPs) to rival chipmakers on fair, reasonable, and non-discriminatory (FRAND) terms violates its commitments to standard-setting organizations and forecloses competitors from the market.

The Court enters a permanent injunction ordering Qualcomm to renegotiate license terms with OEMs without threatening chip supply and to license its modem chip SEPs to rival modem chip suppliers on FRAND terms.`,
  },
  {
    id: 'in-re-enron-corp-bankruptcy',
    case_name: 'In re Enron Corp.',
    case_name_full: 'In re Enron Corp., et al., Debtors. Official Committee of Unsecured Creditors v. Enron Corp.',
    court: 'U.S. Bankruptcy Court for the Southern District of New York',
    court_type: 'FB',
    jurisdiction: 'Bankr. S.D.N.Y.',
    date_filed: '2004-07-15',
    citations: ['314 B.R. 524', '2004 Bankr. LEXIS 1076'],
    citation_count: 2,
    status: 'Precedential / Plan Confirmed',
    text: `ARTHUR J. GONZALEZ, Bankruptcy Judge:

Before the Court is the confirmation of the Supplemental Modified Fifth Amended Joint Plan of Reorganization under Chapter 11 of the Bankruptcy Code, 11 U.S.C. § 1129, proposed by Enron Corp. and its affiliated debtors and debtors-in-possession.

Enron Corp. filed voluntary petitions for relief under Chapter 11 on December 2, 2001, following an unprecedented collapse resulting from pervasive accounting fraud, hidden off-balance-sheet special purpose vehicles (SPVs), and massive undisclosed liabilities. The proceeding constitutes one of the largest and most complex corporate reorganizations in American legal history, involving tens of thousands of creditors asserting claims aggregating tens of billions of dollars.

The Court has reviewed the extensive evidentiary record, the report of the Bankruptcy Examiner Neal Batson, and the objections filed by various classes of creditors, equity security holders, and governmental agencies.

The Plan satisfies all statutory requirements of 11 U.S.C. § 1129(a):
1. The Plan complies with the applicable provisions of title 11 (§ 1129(a)(1));
2. The proponent of the Plan has complied with the applicable provisions of title 11 (§ 1129(a)(2));
3. The Plan has been proposed in good faith and not by any means forbidden by law (§ 1129(a)(3));
4. The payments made or to be made by the proponent for services or costs are reasonable (§ 1129(a)(4));
5. The disclosures satisfy § 1125 and provide adequate information;
6. With respect to each impaired class, each holder will receive or retain property of a value not less than the amount such holder would receive in a liquidation under chapter 7 (§ 1129(a)(7)).

The Plan represents a fair and equitable allocation of assets among unsecured creditors. The objections are OVERRULED, and the Plan of Reorganization is hereby CONFIRMED.`,
  },
  {
    id: 'in-re-lehman-brothers-bankruptcy',
    case_name: 'In re Lehman Brothers Holdings Inc.',
    case_name_full: 'In re Lehman Brothers Holdings Inc., et al., Debtors. Barclays Capital Inc. v. Giddens',
    court: 'U.S. Bankruptcy Court for the Southern District of New York',
    court_type: 'FB',
    jurisdiction: 'Bankr. S.D.N.Y.',
    date_filed: '2011-02-22',
    citations: ['445 B.R. 143', '2011 Bankr. LEXIS 612'],
    citation_count: 2,
    status: 'Precedential',
    text: `JAMES M. PECK, Bankruptcy Judge:

This contested matter addresses the aftermath of the emergency sale of the North American broker-dealer business of Lehman Brothers Inc. to Barclays Capital Inc. in September 2008, at the height of the global financial crisis. Following the expedited Rule 6004 hearing conducted in the early morning hours of September 20, 2008, Barclays purchased substantially all of the operating assets of Lehman's North American broker-dealer.

The Trustee for the liquidation of Lehman Brothers Inc. under the Securities Investor Protection Act (SIPA) and the Official Committee of Unsecured Creditors seek relief from the Sale Order under Federal Rule of Civil Procedure 60(b), alleging that Barclays received an undisclosed and unauthorized "windfall" of several billion dollars in asset value, including clearance box assets and margin deposits.

The Court conducted a 34-day evidentiary hearing featuring testimony from senior executives of Lehman Brothers, Barclays, the Federal Reserve Bank of New York, the Securities and Exchange Commission, and expert witnesses in investment banking and financial valuation.

The Court concludes that the emergency Sale Order entered on September 20, 2008 was valid, necessary, and preserved thousands of jobs while preventing an immediate cascading collapse of the global financial system. The parties negotiated under extreme duress and compressed timeframes dictated by the run on Lehman's repo funding. While Barclays obtained an extraordinary bargain, the evidence does not support a finding of fraud or misrepresentation justifying vacatur under Rule 60(b).

The motions to modify or vacate the Sale Order are accordingly DENIED.`,
  },
  {
    id: 'in-re-purdue-pharma-bankruptcy',
    case_name: 'In re Purdue Pharma L.P.',
    case_name_full: 'In re Purdue Pharma L.P., et al., Debtors. City of Grande Prairie v. Purdue Pharma L.P.',
    court: 'U.S. Bankruptcy Court for the Southern District of New York',
    court_type: 'FB',
    jurisdiction: 'Bankr. S.D.N.Y.',
    date_filed: '2021-09-01',
    citations: ['633 B.R. 53', '2021 Bankr. LEXIS 2422'],
    citation_count: 2,
    status: 'Overruled by Supreme Court (Harrington v. Purdue Pharma, 2024)',
    text: `ROBERT D. DRAIN, United States Bankruptcy Judge:

Before the Court is the confirmation of the Twelfth Amended Joint Chapter 11 Plan of Reorganization of Purdue Pharma L.P. and its associated debtors. The debtors manufactured and marketed OxyContin, an opioid analgesic that has been widely linked to the catastrophic epidemic of opioid addiction and overdose deaths across the United States.

The central issue presented is whether the Bankruptcy Court possesses the legal authority under 11 U.S.C. §§ 105(a) and 1123(b)(6) to confirm a Chapter 11 plan containing non-consensual third-party releases of direct civil claims against non-debtor entities — specifically, members of the Sackler family who owned and controlled Purdue Pharma — in exchange for their contribution of approximately $4.5 billion to fund opioid abatement trusts and compensate victims.

Having considered the testimony of victims, state attorneys general, and restructuring experts, the Court determines that:
1. The Court has subject matter jurisdiction under 28 U.S.C. § 1334 because the third-party claims against the Sacklers directly impact the estate's indemnification obligations and asset pool;
2. Non-consensual third-party releases are permissible in extraordinary circumstances where the releases are essential to the reorganization, there is substantial contribution from the released parties, and the overwhelming majority of affected creditors vote in favor of the plan;
3. Without the settlement and releases, the debtors' assets would be exhausted in protracted, multi-jurisdictional litigation without meaningful recovery for opioid abatement programs or individual victims.

The Plan is CONFIRMED, subject to the modifications outlined herein.`,
  },
  {
    id: 'in-re-crypto-celsius-bankruptcy',
    case_name: 'In re Celsius Network LLC',
    case_name_full: 'In re Celsius Network LLC, et al., Debtors.',
    court: 'U.S. Bankruptcy Court for the Southern District of New York',
    court_type: 'FB',
    jurisdiction: 'Bankr. S.D.N.Y.',
    date_filed: '2023-01-04',
    citations: ['647 B.R. 631', '2023 Bankr. LEXIS 16'],
    citation_count: 2,
    status: 'Precedential',
    text: `MARTIN GLENN, Chief United States Bankruptcy Judge:

The issue before the Court is whether cryptocurrency assets deposited by approximately 600,000 customers into Celsius Network LLC's "Earn" program constitute property of the debtors' bankruptcy estates under 11 U.S.C. § 541, or whether those assets remain the individual property of the account holders.

Celsius operated a cryptocurrency platform that advertised high yields on deposited digital assets. On July 13, 2022, Celsius and its affiliates filed voluntary Chapter 11 petitions following a liquidity crisis in the digital asset markets. At the petition date, the Earn program held cryptocurrency assets valued at approximately $4.2 billion.

The resolution of this question turns on contract law and the plain language of Celsius's Terms of Use. Account holders agreed to the Terms of Use when creating accounts and depositing cryptocurrency. Version 8 of the Terms of Use explicitly provided:
"In consideration for the Earn Rewards... you grant Celsius... all right and title to such Eligible Digital Assets, including ownership rights, and the right to pledge, re-pledge, hypothecate, rehypothecate, sell, loan, or otherwise transfer or use any amount of such Digital Assets."

Under New York law, where a contract is unambiguous, its meaning must be determined from the four corners of the instrument. The Court finds that the Terms of Use constituted a valid, binding contract. The language unambiguous transferred title and ownership of deposited digital assets to the Debtors.

Consequently, the cryptocurrency assets deposited in the Earn program became property of the debtors' bankruptcy estates as of the petition date pursuant to § 541(a). The Earn account holders hold general unsecured claims against the estate rather than ownership rights in specific tokens.

IT IS SO ORDERED.`,
  },
  {
    id: 'court-of-federal-claims-amazon-v-us',
    case_name: 'Amazon Web Services, Inc. v. United States',
    case_name_full: 'Amazon Web Services, Inc., Plaintiff, and Microsoft Corporation, Intervenor, v. The United States, Defendant',
    court: 'U.S. Court of Federal Claims',
    court_type: 'FS',
    jurisdiction: 'Court of Federal Claims',
    date_filed: '2020-04-15',
    citations: ['147 Fed. Cl. 659', '2020 U.S. Claims LEXIS 476'],
    citation_count: 2,
    status: 'Precedential / Action Mooted',
    text: `PATRICIA E. CAMPBELL-SMITH, Judge:

Plaintiff Amazon Web Services, Inc. (AWS) filed this bid protest action challenging the Department of Defense's (DoD) award of the Joint Enterprise Defense Infrastructure (JEDI) Cloud procurement to Intervenor Microsoft Corporation. The JEDI contract represents a single-award indefinite-delivery, indefinite-quantity contract for enterprise-wide commercial cloud services across the DoD, with an estimated ceiling value of $10 billion over a ten-year ordering period.

AWS alleges that DoD's evaluation of proposals was arbitrary, capricious, and affected by improper political influence from senior Executive Branch officials, including public statements critical of AWS and its founder. AWS moves for preliminary injunctive relief to stay performance of the contract and challenges DoD's evaluation of price scenarios and technical factor requirements, specifically Price Scenario 6.

In reviewing a bid protest under the Tucker Act, 28 U.S.C. § 1491(b)(1), the court applies the standard of review set forth in the Administrative Procedure Act, 5 U.S.C. § 706. The court must determine whether the agency's procurement decision was arbitrary, capricious, an abuse of discretion, or otherwise not in accordance with law.

The court concludes that AWS is likely to succeed on the merits of its argument that DoD failed to evaluate Microsoft's proposal in accordance with the solicitation requirements under Price Scenario 6. The government's technical evaluation relied on an unstated interpretation of storage requirements that improperly advantaged Microsoft's proposal over AWS's compliant offering.

Because AWS has demonstrated a likelihood of success on this technical ground and showed irreparable harm in the absence of preliminary relief, the court GRANTED AWS's motion for a preliminary injunction enjoining contract activities pending final resolution.`,
  },
  {
    id: 'court-of-international-trade-solar-panels',
    case_name: 'Risen Energy Co., Ltd. v. United States',
    case_name_full: 'Risen Energy Co., Ltd., Plaintiff, v. United States, Defendant, and SolarWorld Americas, Inc., Defendant-Intervenor',
    court: 'U.S. Court of International Trade',
    court_type: 'FS',
    jurisdiction: 'Court of International Trade',
    date_filed: '2021-06-18',
    citations: ['532 F. Supp. 3d 1297', '45 C.I.T. 642'],
    citation_count: 2,
    status: 'Precedential',
    text: `CLAIRE R. KELLY, Judge:

Plaintiff Risen Energy Co., Ltd. challenges the final results of the Department of Commerce's fifth administrative review of the antidumping duty order on crystalline silicon photovoltaic cells, whether or not assembled into modules, from the People's Republic of China. Commerce assigned Risen a weighted-average dumping margin of 9.61%.

Risen contends that Commerce erred in: (1) calculating surrogate values for financial ratios using financial statements of an Indian manufacturer that received countervailable subsidies; (2) selecting the surrogate country for valuing raw material factors of production; and (3) applying adverse facts available (AFA) to certain export transactions.

The court exercises jurisdiction pursuant to 28 U.S.C. § 1581(c) and reviews Commerce's determinations under 19 U.S.C. § 1516a(b)(1)(B)(i) to determine whether they are unsupported by substantial evidence on the record, or otherwise not in accordance with law.

Substantial evidence requires more than a mere scintilla; it means such relevant evidence as a reasonable mind might accept as adequate to support a conclusion. Universal Camera Corp. v. NLRB, 340 U.S. 474, 477 (1951).

The court sustains Commerce's selection of surrogate country and financial ratios as supported by substantial record evidence. However, Commerce failed to provide an adequate explanation for its application of partial adverse facts available regarding shipping cost adjustments.

Accordingly, the matter is REMANDED to Commerce for reconsideration consistent with this opinion.`,
  },
  {
    id: 'us-tax-court-graham-v-comm',
    case_name: 'Graham v. Commissioner of Internal Revenue',
    case_name_full: 'Katherine Graham, Petitioner v. Commissioner of Internal Revenue, Respondent',
    court: 'United States Tax Court',
    court_type: 'FS',
    jurisdiction: 'U.S. Tax Court',
    date_filed: '1984-09-05',
    citations: ['83 T.C. 459', '1984 U.S. Tax Ct. LEXIS 35'],
    citation_count: 2,
    status: 'Precedential / Affirmed',
    text: `WILBUR, Judge:

Respondent determined a deficiency in petitioner's federal income tax for the taxable year 1972 in the amount of $1,248. The sole issue for decision is whether payments made by petitioner to the Church of Scientology for "auditing" and "training" services are deductible as charitable contributions under Section 170 of the Internal Revenue Code of 1954.

Section 170(a) allows as a deduction any charitable contribution made within the taxable year to a qualifying organization. A "contribution" or "gift" has long been defined as a voluntary transfer of property made without the receipt or expectation of full and adequate financial consideration in return.

Petitioner argues that Scientology auditing is a purely religious sacrament, analogous to masses in the Catholic Church or pew rents in synagogues, and that payments made for auditing must be treated as tax-deductible charitable gifts.

The evidence presented demonstrates that the Church of Scientology operates on a fixed fee schedule for auditing and training sessions, often referred to as the doctrine of "exchange." Auditing sessions are strictly conditioned on prepayment according to precise hourly rates. A participant who does not pay the mandatory fee is ineligible for the auditing sessions.

The Court finds that the payments made by petitioner were not unrequited gifts, but rather were direct quid pro quo payments made in exchange for specific personal services. Under the established doctrine of this Court, payments made with the expectation of receiving a commensurate quid pro quo benefit cannot qualify as charitable contributions under Section 170.

Decision will be entered for the respondent.`,
  },
  {
    id: 'ny-times-v-sullivan',
    case_name: 'New York Times Co. v. Sullivan',
    case_name_full: 'New York Times Co. v. L. B. Sullivan',
    court: 'Supreme Court of the United States',
    court_type: 'F',
    jurisdiction: 'US Federal',
    date_filed: '1964-03-09',
    citations: ['376 U.S. 254', '84 S. Ct. 710', '11 L. Ed. 2d 686'],
    citation_count: 3,
    status: 'Precedential',
    text: `MR. JUSTICE BRENNAN delivered the opinion of the Court.

We are required in this case to determine for the first time the extent to which the constitutional protections for speech and press limit a State's power to award damages in a libel action brought by a public official against critics of his official conduct.

Respondent L. B. Sullivan is one of three elected Commissioners of the City of Montgomery, Alabama. He brought this civil libel action against four individual petitioners, who are African-American clergymen, and against petitioner The New York Times Company, a New York corporation which publishes the daily newspaper The New York Times. A jury in the Circuit Court of Montgomery County awarded him a $500,000 verdict against all petitioners, and the Supreme Court of Alabama affirmed.

The advertisement entitled "Heed Their Rising Voices" appeared in The New York Times on March 29, 1960. It described civil rights demonstrations in Montgomery and alleged that state and local police had engaged in intimidation and terror against student demonstrators.

We consider this case against the background of a profound national commitment to the principle that debate on public issues should be uninhibited, robust, and wide-open, and that it may well include vehement, caustic, and sometimes unpleasantly sharp attacks on government and public officials.

The rule of law applied by the Alabama courts is constitutionally deficient for failure to provide the safeguards for freedom of speech and of the press that are required by the First and Fourteenth Amendments in a libel action brought by a public official against critics of his official conduct.

We hold today that the Constitution delimits a State's power to award damages for libel in actions brought by public officials against critics of their official conduct. Under this rule, a public official is prohibited from recovering damages for a defamatory falsehood relating to his official conduct unless he proves that the statement was made with "actual malice" — that is, with knowledge that it was false or with reckless disregard of whether it was false or not.

Reversed and remanded.`,
  },
  {
    id: 'mapp-v-ohio',
    case_name: 'Mapp v. Ohio',
    case_name_full: 'Dollree Mapp, Appellant, v. State of Ohio',
    court: 'Supreme Court of the United States',
    court_type: 'F',
    jurisdiction: 'US Federal',
    date_filed: '1961-06-19',
    citations: ['367 U.S. 643', '81 S. Ct. 1684', '6 L. Ed. 2d 1081'],
    citation_count: 3,
    status: 'Precedential',
    text: `MR. JUSTICE CLARK delivered the opinion of the Court.

Appellant Dollree Mapp stands convicted of having knowingly had in her possession and under her control certain lewd and lascivious books, pictures, and photographs in violation of § 2905.34 of Ohio's Revised Code. The only issue of substance presented in this appeal is whether evidence obtained by an unconstitutional search and seizure is admissible in a state criminal prosecution.

On May 23, 1957, three Cleveland police officers arrived at appellant's residence in that city pursuant to information that a person was hiding out in the home who was wanted for questioning in connection with a recent bombing. Upon their arrival, the officers knocked on the door and demanded entrance, but appellant, after telephoning her attorney, refused to admit them without a search warrant. The officers placed the house under surveillance.

Three hours later, additional officers arrived and forcibly broke into the house. When appellant demanded to see a warrant, an officer held up a piece of paper. Appellant snatched the paper and placed it in her bodice. A struggle ensued in which officers handcuffed appellant, recovered the paper, and forcibly searched her entire home, including bedrooms, dressers, and basement trunks, where the alleged contraband was discovered. No search warrant was ever produced at trial.

In Weeks v. United States, 232 U.S. 383 (1914), this Court held that in a federal prosecution the Fourth Amendment barred the use of evidence secured through an illegal search and seizure. In Wolf v. Colorado, 338 U.S. 25 (1949), the Court decided that the Fourth Amendment was applicable to the States through the Due Process Clause of the Fourteenth Amendment, but declined to extend the exclusionary rule to state trials.

We hold that all evidence obtained by searches and seizures in violation of the Constitution is, by that same authority, inadmissible in a state court. The ignoble shortcut to conviction left open to the State by Wolf tends to destroy the entire system of constitutional restraints on police power. Having once recognized that the right to privacy embodied in the Fourth Amendment is enforceable against the States, we can no longer permit that right to remain an empty promise.

The judgment of the Supreme Court of Ohio is reversed.`,
  },
  {
    id: 'wickard-v-filburn',
    case_name: 'Wickard v. Filburn',
    case_name_full: 'Claude R. Wickard, Secretary of Agriculture of the United States, et al., Appellants, v. Roscoe C. Filburn',
    court: 'Supreme Court of the United States',
    court_type: 'F',
    jurisdiction: 'US Federal',
    date_filed: '1942-11-09',
    citations: ['317 U.S. 111', '63 S. Ct. 82', '87 L. Ed. 122'],
    citation_count: 3,
    status: 'Precedential',
    text: `MR. JUSTICE JACKSON delivered the opinion of the Court.

The appellee, Roscoe C. Filburn, was the owner of a small farm in Montgomery County, Ohio. Under the Agricultural Adjustment Act of 1938, as amended, the Secretary of Agriculture established a marketing quota for wheat to control national supply and stabilize market prices. Filburn was allotted a wheat acreage of 11.1 acres and a normal yield of 20.1 bushels of wheat per acre.

Filburn sowed and harvested 23 acres of wheat, producing 239 bushels in excess of his marketing quota. He intended to consume the excess wheat on his own farm — feeding it to poultry and livestock, using some for seed, and grinding the rest into flour for home consumption. Filburn did not intend to sell any of this wheat on the commercial market.

The Secretary of Agriculture assessed a statutory penalty of $117.11 against Filburn for marketing quota excess. Filburn brought suit in the United States District Court to enjoin enforcement of the penalty, contending that the regulation of wheat produced and consumed entirely on his own farm exceeded the power of Congress under the Commerce Clause.

The Court has made clear that even if an activity be local and though it may not be regarded as commerce, it may still, whatever its nature, be reached by Congress if it exerts a substantial economic effect on interstate commerce, and this irrespective of whether such effect is what might at some earlier time have been defined as "direct" or "indirect."

One of the primary purposes of the Act in question was to increase the market price of wheat and to that end to limit the volume thereof that could affect the market. It can hardly be denied that a factor of such volume and variability as home-consumed wheat would have a substantial influence on price and market conditions. That an individual producer's own contribution to the demand for wheat may be trivial by itself is not enough to remove him from the scope of federal regulation where, as here, his contribution, taken together with that of many others similarly situated, is far from trivial.

Reversed.`,
  },
  {
    id: 'lochner-v-new-york',
    case_name: 'Lochner v. New York',
    case_name_full: 'Joseph Lochner, Plaintiff in Error, v. People of the State of New York',
    court: 'Supreme Court of the United States',
    court_type: 'F',
    jurisdiction: 'US Federal',
    date_filed: '1905-04-17',
    citations: ['198 U.S. 45', '25 S. Ct. 539', '49 L. Ed. 937'],
    citation_count: 3,
    status: 'Historical / Repudiated',
    text: `MR. JUSTICE PECKHAM delivered the opinion of the Court.

The indictment accused the plaintiff in error of committing a misdemeanor by wrongfully and unlawfully requiring and permitting an employee working for him in his biscuit, bread, and cake bakery and confectionery establishment in Utica, Oneida County, New York, to work more than sixty hours in one week, in violation of § 110 of article 8 of chapter 415 of the Laws of 1897, known as the Labor Law of the State of New York.

The mandate of the statute that no employee shall be required or permitted to work in a bakery more than sixty hours in a week has been upheld by the Court of Appeals of New York as a valid health regulation under the police power of the State.

The question whether this act is valid as a labor law, pure and simple, may be at once dismissed. There is no reasonable ground for interfering with the liberty of person or the right of free contract by determining the hours of labor in the occupation of a baker. Viewed in the light of a purely labor law, with no reference to the question of health, we think that a law like the one before us involves neither the safety, the morals, nor the welfare of the public, and that the interest of the public is not in the slightest degree affected by such an act.

The right to purchase or to sell labor is part of the liberty protected by the Fourteenth Amendment, unless there are circumstances which exclude the right. There are, however, certain powers, existing in the sovereignty of each State in the Union, somewhat vaguely termed police powers, the exact description and limitation of which have not been attempted by the courts.

We think the limit of the police power has been reached and passed in this case. There is, in our judgment, no reasonable foundation for holding this to be necessary or appropriate as a health law to safeguard the public health, or the health of the individuals who are following the trade of a baker. Clean and wholesome bread does not depend on whether the baker works but ten hours per day or only sixty hours a week.

The judgment of the Court of Appeals of New York is reversed.`,
  },
  {
    id: 'obergefell-v-hodges',
    case_name: 'Obergefell v. Hodges',
    case_name_full: 'James Obergefell, et al., Petitioners v. Richard Hodges, Director, Ohio Department of Health, et al.',
    court: 'Supreme Court of the United States',
    court_type: 'F',
    jurisdiction: 'US Federal',
    date_filed: '2015-06-26',
    citations: ['576 U.S. 644', '135 S. Ct. 2584', '192 L. Ed. 2d 609'],
    citation_count: 3,
    status: 'Precedential',
    text: `JUSTICE KENNEDY delivered the opinion of the Court.

The Constitution promises liberty to all within its reach, a liberty that includes certain specific rights that allow persons, within a lawful realm, to define and express their identity. The petitioners in these cases seek to find that liberty by marrying someone of the same sex and having their marriages deemed lawful on the same terms and conditions as marriages between persons of the opposite sex.

These cases come from Michigan, Kentucky, Ohio, and Tennessee, States that define marriage as a union between one man and one woman. The petitioners are 14 same-sex couples and two men whose same-sex partners are deceased. They filed suits in United States District Courts in their home States, arguing that state officials violated the Fourteenth Amendment by denying them the right to marry or to have their marriages lawfully performed in other States recognized.

The ancient origins of marriage confirm its centrality, but it has not stood in isolation from developments in law and society. The history of marriage is one of both continuity and change. That institution — even as it has evolved — has stayed central to our social order.

Under the Due Process Clause of the Fourteenth Amendment, no State shall "deprive any person of life, liberty, or property, without due process of law." The fundamental liberties protected by this Clause include most of the rights enumerated in the Bill of Rights. In addition these liberties extend to certain personal choices central to individual dignity and autonomy, including intimate choices that define personal identity and beliefs.

The right to marry is fundamental. It satisfies four primary principles: First, the right to personal choice regarding marriage is inherent in the concept of individual autonomy. Second, the right to marry supports a two-person union unlike any other in its importance to the committed individuals. Third, it safeguards children and families and draws meaning from related rights of childrearing, procreation, and education. Fourth, marriage is a keystone of our social order.

There is no difference between same- and opposite-sex couples with respect to these principles. It is demeaning to lock same-sex couples out of a central institution of the Nation's society.

The right to marry is a fundamental right inherent in the liberty of the person, and under the Due Process and Equal Protection Clauses of the Fourteenth Amendment couples of the same-sex may not be deprived of that right and that liberty.

The judgment of the Court of Appeals for the Sixth Circuit is reversed.`,
  },
  {
    id: 'korematsu-v-us',
    case_name: 'Korematsu v. United States',
    case_name_full: 'Fred Toyosaburo Korematsu, Petitioner, v. United States',
    court: 'Supreme Court of the United States',
    court_type: 'F',
    jurisdiction: 'US Federal',
    date_filed: '1944-12-18',
    citations: ['323 U.S. 214', '65 S. Ct. 193', '89 L. Ed. 194'],
    citation_count: 3,
    status: 'Overruled by Trump v. Hawaii (2018)',
    text: `MR. JUSTICE BLACK delivered the opinion of the Court.

The petitioner, an American citizen of Japanese descent, was convicted in a federal district court for remaining in San Leandro, California, a "Military Area," contrary to Civilian Exclusion Order No. 34 of the Commanding General of the Western Defense Command, U.S. Army, which directed that, after May 9, 1942, all persons of Japanese ancestry, both alien and non-alien, should be excluded from that area. No question was made as to petitioner's loyalty to the United States.

It should be noted, to begin with, that all legal restrictions which curtail the civil rights of a single racial group are immediately suspect. That is not to say that all such restrictions are unconstitutional. It is to say that courts must subject them to the most rigid scrutiny. Pressing public necessity may sometimes justify the existence of such restrictions; racial antagonism never can.

In the light of the principles we announced in the Hirabayashi case, we are unable to conclude that it was beyond the war power of Congress and the Executive to exclude those of Japanese ancestry from the West Coast area at the time they did. At that time, approximately 5,000 American citizens of Japanese ancestry refused to swear unqualified allegiance to the United States and to renounce allegiance to the Japanese Emperor, and several thousand evacuated citizens requested repatriation to Japan.

We uphold the exclusion order as of the time it was made and when the petitioner violated it. Compulsory exclusion of large groups of citizens from their homes, except under circumstances of direst emergency and peril, is inconsistent with our basic institutions. But when, under conditions of modern warfare, our shores are threatened by hostile forces, the power to protect must be commensurate with the threatened danger.

Affirmed.`,
  },
  {
    id: 'terry-v-ohio',
    case_name: 'Terry v. Ohio',
    case_name_full: 'John W. Terry, Petitioner, v. State of Ohio',
    court: 'Supreme Court of the United States',
    court_type: 'F',
    jurisdiction: 'US Federal',
    date_filed: '1968-06-10',
    citations: ['392 U.S. 1', '88 S. Ct. 1868', '20 L. Ed. 2d 889'],
    citation_count: 3,
    status: 'Precedential',
    text: `MR. CHIEF JUSTICE WARREN delivered the opinion of the Court.

This case presents serious questions concerning the role of the Fourth Amendment in the confrontation on the street between the citizen and the policeman investigating suspicious circumstances.

Petitioner Terry was convicted of carrying a concealed weapon and sentenced to the statutorily prescribed term of one to three years in the penitentiary. Following the denial of a pretrial motion to suppress, the prosecution introduced in evidence two revolvers and a number of bullets seized from Terry and a codefendant, Richard Chilton, by Cleveland Police Detective Martin McFadden.

At the hearing on the motion to suppress, Detective McFadden testified that while he was patrolling in plain clothes in downtown Cleveland at approximately 2:30 in the afternoon, his attention was attracted by two men, Chilton and Terry, standing on the corner of Huron Road and Euclid Avenue. He had never seen the two men before, and he was unable to say precisely what first drew his eye to them. However, he testified that he had been a policeman for 39 years and a detective for 35, and that he had been assigned to patrol this vicinity of downtown Cleveland for shoplifters and pickpockets for 30 years.

McFadden observed the men repeatedly walk past a store window, peer inside, and confer together. Suspecting that they were "casing a job, a stick-up," McFadden approached them, identified himself as a police officer, and asked for their names. When the men mumbled responses, McFadden spun Terry around and patted down the outside of his clothing, discovering a .38 caliber revolver in his overcoat pocket. He then patted down Chilton and found another revolver.

The Fourth Amendment provides that "the right of the people to be secure in their persons, houses, papers, and effects, against unreasonable searches and seizures, shall not be violated." There is no question that Officer McFadden "seized" petitioner and subjected him to a "search" when he took hold of him and patted down the outer surfaces of his clothing.

We merely hold today that where a police officer observes unusual conduct which leads him reasonably to conclude in light of his experience that criminal activity may be afoot and that the persons with whom he is dealing may be armed and presently dangerous, where in the course of investigating this behavior he identifies himself as a policeman and makes reasonable inquiries, and where nothing in the initial stages of the encounter serves to dispel his reasonable fear for his own or others' safety, he is entitled for the protection of himself and others in the area to conduct a carefully limited search of the outer clothing of such persons in an attempt to discover weapons which might be used to assault him. Such a search is a reasonable search under the Fourth Amendment, and any weapons seized may properly be introduced in evidence against the person from whom they were taken.

Affirmed.`,
  },
  {
    id: 'mcculloch-v-maryland',
    case_name: 'McCulloch v. Maryland',
    case_name_full: 'McCulloch, Cashier of the Bank of the United States, v. State of Maryland, et al.',
    court: 'Supreme Court of the United States',
    court_type: 'F',
    jurisdiction: 'US Federal',
    date_filed: '1819-03-06',
    citations: ['17 U.S. 316', '4 Wheat. 316', '4 L. Ed. 579'],
    citation_count: 3,
    status: 'Precedential',
    text: `MR. CHIEF JUSTICE MARSHALL delivered the opinion of the Court.

In the case now to be determined, the defendant, a sovereign State, denies the obligation of a law enacted by the legislature of the Union, and the plaintiff, on his part, contests the validity of an act which has been passed by the legislature of that State. The constitution of our country, in its most interesting and vital parts, is to be considered; the conflicting powers of the government of the Union and of its members, as marked in that constitution, are to be discussed; and an opinion given, which may essentially influence the great operations of the government.

The first question made in the cause is, has Congress power to incorporate a bank?

This government is acknowledged by all to be one of enumerated powers. The principle, that it can exercise only the powers granted to it, would seem too apparent to have required to be enforced by all those arguments which its enlightened friends, while it was depending before the people, found it necessary to urge.

Although, among the enumerated powers of government, we do not find the word "bank" or "incorporation," we find the great powers to lay and collect taxes; to borrow money; to regulate commerce; to declare and conduct a war; and to raise and support armies and navies.

Let the end be legitimate, let it be within the scope of the constitution, and all means which are appropriate, which are plainly adapted to that end, which are not prohibited, but consist with the letter and spirit of the constitution, are constitutional.

The second question is, whether the State of Maryland may, without violating the constitution, tax that branch?

That the power to tax involves the power to destroy; that the power to destroy may defeat and render useless the power to create; that there is a plain repugnance, in conferring on one government a power to control the constitutional measures of another, which other, with respect to those very measures, is declared to be supreme over that which exerts the control, are propositions not to be denied.

The States have no power, by taxation or otherwise, to retard, impede, burden, or in any manner control the operations of the constitutional laws enacted by Congress to carry into execution the powers vested in the general government. This is, we think, the unavoidable consequence of that supremacy which the constitution has declared.

Judgment reversed.`,
  },
  {
    id: 'in-re-sam-bankman-fried-ftx',
    case_name: 'In re FTX Trading Ltd.',
    case_name_full: 'In re FTX Trading Ltd., et al., Debtors.',
    court: 'U.S. Bankruptcy Court for the District of Delaware',
    court_type: 'FB',
    jurisdiction: 'Bankr. D. Del.',
    date_filed: '2024-10-07',
    citations: ['662 B.R. 490', '2024 Bankr. LEXIS 2411'],
    citation_count: 2,
    status: 'Precedential / Plan Confirmed',
    text: `JOHN T. DORSEY, United States Bankruptcy Judge:

Before the Court is confirmation of the Debtors' Joint Chapter 11 Plan of Reorganization, as modified, for FTX Trading Ltd. and its affiliated debtors.

On November 11, 2022, following a catastrophic liquidity crisis and the revelation of extensive commingling of customer funds between the FTX cryptocurrency exchange and Alameda Research LLC, the Debtors filed voluntary petitions for Chapter 11 relief. John J. Ray III assumed leadership as Chief Executive Officer and restructuring officer.

Under the leadership of Mr. Ray and his advisors, the Debtors engaged in a global asset recovery campaign that successfully marshaled between $14.7 billion and $16.5 billion in liquidated value — an extraordinary recovery that allows the Plan to propose returning 100% of allowed petition-date claim amounts to non-governmental creditors, plus interest.

Objections were filed by the U.S. Trustee, certain ad hoc customer groups regarding the petition-date dollar valuation of digital assets under 11 U.S.C. § 502(b), and sovereign claimants.

The Court finds:
1. Valuing customer claims in U.S. dollars as of the petition date is mandated by the plain language of 11 U.S.C. § 502(b), which requires the Court to determine the amount of such claim in lawful currency of the United States as of the date of the filing of the petition;
2. The Plan satisfies the best interests test under § 1129(a)(7) because creditors will receive significantly more under this consensual orderly liquidation than in a Chapter 7 liquidation;
3. The consensual releases and exculpation provisions comply with Third Circuit law under In re Continental Airlines.

All outstanding objections are OVERRULED, and the Plan of Reorganization is CONFIRMED.`,
  },
  {
    id: 'calif-v-google-monopoly',
    case_name: 'United States v. Google LLC',
    case_name_full: 'United States of America, et al., Plaintiffs, v. Google LLC, Defendant',
    court: 'U.S. District Court for the District of Columbia',
    court_type: 'FD',
    jurisdiction: 'D.D.C.',
    date_filed: '2024-08-05',
    citations: ['2024 U.S. Dist. LEXIS 139162', 'Civil Action No. 20-cv-3010 (APM)'],
    citation_count: 2,
    status: 'Precedential',
    text: `AMIT P. MEHTA, United States District Judge:

Google is a monopolist, and it has acted as one to maintain its monopoly. It has violated Section 2 of the Sherman Act.

Specifically, the court holds that: (1) there are two relevant antitrust product markets — general search services and general search text ads; (2) Google has monopoly power in those markets; (3) Google's distribution agreements are exclusive and have anticompetitive effects; and (4) Google has not offered valid procompetitive justifications for those agreements. Importantly, the court also finds that Google has exercised its monopoly power by charging supracompetitive prices for general search text ads. That conduct has enabled Google to earn supracompetitive profits.

Google's agreements with Apple, Samsung, other device manufacturers, and major web browser developers (such as Mozilla) ensure that Google is the pre-installed default search engine on billions of consumer mobile devices and web browsers. In 2021 alone, Google paid billions of dollars — including more than $20 billion to Apple — to secure default placement. These revenue-sharing default agreements foreclose rival search engines like Microsoft's Bing and DuckDuckGo from reaching critical distribution channels, depriving them of the scale needed to compete effectively.

The court concludes that Google has maintained its monopoly power through these exclusionary default distribution agreements in violation of Section 2 of the Sherman Act.

SO ORDERED.`,
  },
  {
    id: 'epic-games-v-apple-district',
    case_name: 'Epic Games, Inc. v. Apple Inc.',
    case_name_full: 'Epic Games, Inc., Plaintiff and Counter-defendant, v. Apple Inc., Defendant and Counterclaimant',
    court: 'U.S. District Court for the Northern District of California',
    court_type: 'FD',
    jurisdiction: 'N.D. Cal.',
    date_filed: '2021-09-10',
    citations: ['559 F. Supp. 3d 898', '2021 U.S. Dist. LEXIS 172525'],
    citation_count: 2,
    status: 'Affirmed in part, reversed in part (67 F.4th 946)',
    text: `YVONNE GONZALEZ ROGERS, District Judge:

Plaintiff Epic Games, Inc. brings this antitrust and unfair competition suit against Defendant Apple Inc. Epic Games develops the popular video game Fortnite. Apple operates the iOS platform, including the App Store, through which iOS applications are distributed.

Epic challenges Apple's restrictions that require developers to distribute iOS applications exclusively through Apple's App Store and to use Apple's In-App Purchase (IAP) engine for digital goods, through which Apple assesses a 30% commission. Epic implemented an unauthorized direct payment system in Fortnite, prompting Apple to remove Fortnite from the App Store. Epic sued, alleging violations of Sections 1 and 2 of the Sherman Act and California's Unfair Competition Law (UCL).

Following a 16-day bench trial, the Court makes the following findings and conclusions:

1. Relevant Market: The relevant market is digital mobile gaming transactions, not iOS app distribution or all smartphone operating systems. In this market, Apple enjoys substantial market power with operating margins exceeding 70%, but the evidence does not establish illegal monopoly power under Section 2.
2. Section 1 Tying: Epic failed to prove an unlawful tie between iOS distribution and IAP.
3. California UCL: Apple's anti-steering rules, which prohibit developers from including buttons, external links, or other calls to action that direct customers to purchasing mechanisms other than IAP, violate California's Unfair Competition Law. These provisions hide critical pricing information from consumers and artificially stifle competition.

The Court issues a nationwide permanent injunction enjoining Apple from prohibiting developers from including external links and buttons to alternative purchasing mechanisms.`,
  },
  {
    id: 'us-v-voyager-digital-bankruptcy',
    case_name: 'In re Voyager Digital Holdings, Inc.',
    case_name_full: 'In re Voyager Digital Holdings, Inc., et al., Debtors.',
    court: 'U.S. Bankruptcy Court for the Southern District of New York',
    court_type: 'FB',
    jurisdiction: 'Bankr. S.D.N.Y.',
    date_filed: '2023-03-08',
    citations: ['649 B.R. 111', '2023 Bankr. LEXIS 590'],
    citation_count: 2,
    status: 'Precedential',
    text: `MICHAEL E. WILES, United States Bankruptcy Judge:

The Debtors, formerly operating a cryptocurrency brokerage platform, seek confirmation of their Third Amended Joint Plan of Reorganization under Chapter 11. The centerpiece of the Plan is an asset purchase agreement under which BAM Trading Services Inc., d/b/a Binance.US, agreed to purchase the Debtors' cryptocurrency customer accounts and transfer digital assets directly to account holders.

The Securities and Exchange Commission (SEC) and the U.S. Trustee objected to confirmation. The SEC contended that the distribution of digital assets under the Plan might constitute the unregistered offer or sale of securities under Section 5 of the Securities Act of 1933, and objected to the standard exculpation clause protecting the Debtors and their professionals from liability.

The Court finds that the SEC's objections must be overruled. The SEC has declined to take an affirmative position as to which, if any, specific cryptocurrency tokens held on the Voyager platform are securities, offering only vague assertions that transactions might theoretically violate securities laws. Regulatory agencies cannot halt bankruptcy reorganizations on mere hypothetical possibilities without presenting concrete evidence of statutory violations.

Furthermore, Section 1125(e) of the Bankruptcy Code provides a statutory safe harbor for persons who solicit acceptance of a plan or participate in the offer, issuance, sale, or purchase of a security in good faith. The exculpation provisions in the Plan are customary, necessary, and tailored in accordance with Second Circuit law.

The Plan is hereby CONFIRMED.`,
  },
  {
    id: 'us-court-intl-trade-steel-tariffs',
    case_name: 'Transpacific Steel LLC v. United States',
    case_name_full: 'Transpacific Steel LLC, Plaintiff, v. United States, Defendant',
    court: 'U.S. Court of International Trade',
    court_type: 'FS',
    jurisdiction: 'Court of International Trade',
    date_filed: '2020-07-14',
    citations: ['466 F. Supp. 3d 1246', '44 C.I.T. 841'],
    citation_count: 2,
    status: 'Reversed on Appeal (4 F.4th 1306)',
    text: `Before: JANE A. RESTANI, Judge; RICHARD K. EATON, Judge; GARY S. KATZMANN, Judge.

KATZMANN, Judge:

This case addresses the statutory limits on Presidential authority under Section 232 of the Trade Expansion Act of 1962, 19 U.S.C. § 1862. Section 232 authorizes the President to adjust imports of articles that threaten to impair the national security of the United States, following an investigation and report by the Secretary of Commerce.

In Proclamation 9705, issued in March 2018, the President imposed a 25% tariff on steel imports. In August 2018, months after the statutory 90-day deadline specified in Section 232(c)(1) had lapsed, the President issued Proclamation 9772, doubling the tariff on steel articles imported from Turkey to 50%.

Plaintiff Transpacific Steel LLC, an importer of Turkish steel, challenges Proclamation 9772 as ultra vires for violating the statutory deadlines and the procedural requirements of Section 232, as well as the Equal Protection guarantee of the Fifth Amendment.

We hold that the President's authority under Section 232 is constrained by the procedural and temporal limitations enacted by Congress. The statutory timeline established in Section 232 is mandatory, not directory. The President may not continuously modify tariffs under a stale Commerce Department report long after the statutory decision window has expired without initiating a new investigation.

Proclamation 9772 is declared invalid as contrary to law, and Plaintiff is entitled to a refund of excess duties paid.`,
  },
  {
    id: 'court-federal-claims-health-ins-risk-corridors',
    case_name: 'Moda Health Plan, Inc. v. United States',
    case_name_full: 'Moda Health Plan, Inc., Plaintiff, v. The United States, Defendant',
    court: 'U.S. Court of Federal Claims',
    court_type: 'FS',
    jurisdiction: 'Court of Federal Claims',
    date_filed: '2017-02-09',
    citations: ['130 Fed. Cl. 436', '2017 U.S. Claims LEXIS 89'],
    citation_count: 2,
    status: 'Affirmed by Supreme Court (Maine Community Health Options, 2020)',
    text: `THOMAS C. WHEELER, Judge:

This Tucker Act breach of statutory obligation case arises from the "Risk Corridors" program established by Section 1342 of the Patient Protection and Affordable Care Act (ACA), 42 U.S.C. § 18062. The Risk Corridors program was designed to encourage health insurance issuers to participate in newly established individual and small-group health insurance exchanges by sharing risk with the government during the first three years of exchange operations (2014-2016).

Under the statutory formula in Section 1342, plans with unprofitable experience were entitled to payments from the Department of Health and Human Services (HHS). HHS conceded that it owed Moda Health Plan $214 million in Risk Corridors payments for benefit years 2014 and 2015, but paid only $11 million, citing appropriations riders enacted by Congress in fiscal years 2015 and 2016 that prohibited HHS from using general funds to make Risk Corridors payments.

The court concludes that Section 1342 of the ACA created a binding statutory obligation on the United States to make the full payments mandated by the statutory formula. The subsequent appropriations riders restricted the source of funds available to HHS, but did not repeal or eliminate the government's underlying statutory liability.

When the government enters into statutory commitments that induce private parties to enter new markets and incur immense financial obligations, the government must honor its word. The government cannot entice private insurers into the market with promises of statutory backstops and then walk away when payments come due.

Judgment is entered in favor of Moda Health Plan against the United States in the sum of $209,977,927.`,
  },
  {
    id: 'gibbons-v-ogden',
    case_name: 'Gibbons v. Ogden',
    case_name_full: 'Thomas Gibbons, Appellant, v. Aaron Ogden, Appellee',
    court: 'Supreme Court of the United States',
    court_type: 'F',
    jurisdiction: 'US Federal',
    date_filed: '1824-03-02',
    citations: ['22 U.S. 1', '9 Wheat. 1', '6 L. Ed. 23'],
    citation_count: 3,
    status: 'Precedential',
    text: `MR. CHIEF JUSTICE MARSHALL delivered the opinion of the Court.

This case presents the question whether the legislature of the State of New York possessed the constitutional authority to grant an exclusive steamboat navigation monopoly over the waters of New York to Robert R. Livingston and Robert Fulton, as against Thomas Gibbons, who operated steamboats licensed under a federal Act of Congress regulating the coastal trade.

The Constitution of the United States declares that Congress shall have power "to regulate Commerce with foreign Nations, and among the several States, and with the Indian Tribes."

Commerce, undoubtedly, is traffic, but it is something more: it is intercourse. It describes the commercial intercourse between nations, and parts of nations, in all its branches, and is regulated by prescribing rules for carrying on that intercourse. The mind can scarcely conceive a system for regulating commerce between nations, which shall exclude all laws concerning navigation.

The power over commerce, including navigation, was one of the primary objects for which the people of America adopted their government. The power of Congress, then, comprehends navigation within the limits of every State in the Union; so far as that navigation may be, in any manner, connected with "commerce with foreign nations, or among the several States."

The decree of the Court for the Trial of Impeachments and Correction of Errors of New York is REVERSED, and the injunction against Gibbons is dissolved.`,
  },
  {
    id: 'district-court-us-v-at-and-t',
    case_name: 'United States v. American Telephone and Telegraph Co.',
    case_name_full: 'United States of America, Plaintiff, v. American Telephone and Telegraph Company, et al., Defendants',
    court: 'U.S. District Court for the District of Columbia',
    court_type: 'FD',
    jurisdiction: 'D.D.C.',
    date_filed: '1982-08-11',
    citations: ['552 F. Supp. 131', '1982-2 Trade Cas. (CCH) P64,979'],
    citation_count: 2,
    status: 'Precedential / Consent Decree',
    text: `HAROLD H. GREENE, District Judge:

The United States brought this antitrust action against the American Telephone and Telegraph Company (AT&T), Western Electric Company, Inc., and Bell Telephone Laboratories, Inc., alleging monopolization of the telecommunications service and equipment markets in violation of Section 2 of the Sherman Act.

After nearly eight years of litigation, eleven months of trial, and the testimony of 350 witnesses, the parties submitted a proposed Consent Decree providing for the divestiture of the twenty-two local Bell Operating Companies (BOCs) from AT&T's long-distance, equipment manufacturing, and research operations.

The Court concludes that the structural separation of the local exchange bottleneck monopolies from competitive long-distance and manufacturing businesses is essential to eradicate the historic anticompetitive incentives that suppressed innovation and cross-subsidized rates.

The Modification of Final Judgment is APPROVED subject to the required revisions.`,
  },
  {
    id: 'in-re-general-motors-corp-bankruptcy',
    case_name: 'In re General Motors Corp.',
    case_name_full: 'In re General Motors Corp., et al., Debtors.',
    court: 'U.S. Bankruptcy Court for the Southern District of New York',
    court_type: 'FB',
    jurisdiction: 'Bankr. S.D.N.Y.',
    date_filed: '2009-07-05',
    citations: ['407 B.R. 463', '2009 Bankr. LEXIS 1778'],
    citation_count: 2,
    status: 'Precedential / Section 363 Sale Approved',
    text: `ROBERT E. GERBER, United States Bankruptcy Judge:

General Motors Corporation, founded in 1908 and long a cornerstone of American manufacturing, filed for Chapter 11 relief on June 1, 2009, confronting existential liquidity shortages brought about by secular market share declines and the global financial crisis.

The Debtors move under Section 363(b) of the Bankruptcy Code for approval of an expedited sale of substantially all of GM's operating assets to a newly formed purchasing vehicle sponsored by the United States Department of the Treasury and the governments of Canada and Ontario ("New GM").

The Court finds that Section 363(b) authorizes the sale where, as here, an extraordinary business emergency exists. Without the funding provided by the federal government conditioned on the 363 sale, General Motors would be forced into an immediate Chapter 7 liquidation. The Section 363 sale is hereby APPROVED.`,
  },
  {
    id: 'fed-cir-oracle-v-google',
    case_name: 'Oracle America, Inc. v. Google LLC',
    case_name_full: 'Oracle America, Inc., Plaintiff-Appellant, v. Google LLC, Defendant-Cross-Appellant',
    court: 'U.S. Court of Appeals for the Federal Circuit',
    court_type: 'FS',
    jurisdiction: 'Federal Circuit',
    date_filed: '2018-03-27',
    citations: ['886 F.3d 1179', '126 U.S.P.Q.2D (BNA) 1109'],
    citation_count: 2,
    status: 'Precedential',
    text: `Before O'MALLEY, PLAGER, and TARANTO, Circuit Judges.

O'MALLEY, Circuit Judge:

This copyright dispute concerns Google's unauthorized copying of 37 packages of the Java Application Programming Interface (API) declaring code and declaring structure, sequence, and organization (SSO) in its Android mobile operating system.

In a prior appeal, this court held that the Java API declaring code and SSO are copyrightable under the Copyright Act. 750 F.3d 1339 (Fed. Cir. 2014). On remand, a jury returned a verdict finding that Google's use of the declaring code constituted fair use under 17 U.S.C. § 107.

We conclude that Google's copying of the Java declaring code was not fair use as a matter of law. Reversed and remanded.`,
  },
  {
    id: 'hamdan-v-rumsfeld',
    case_name: 'Hamdan v. Rumsfeld',
    case_name_full: 'Salim Ahmed Hamdan, Petitioner, v. Donald H. Rumsfeld, Secretary of Defense, et al.',
    court: 'Supreme Court of the United States',
    court_type: 'F',
    jurisdiction: 'US Federal',
    date_filed: '2006-06-29',
    citations: ['548 U.S. 557', '126 S. Ct. 2749', '165 L. Ed. 2d 723'],
    citation_count: 3,
    status: 'Precedential',
    text: `JUSTICE STEVENS delivered the opinion of the Court.

Petitioner Salim Ahmed Hamdan, a Yemeni national, was captured in Afghanistan in November 2001 and transported to the detention camp at Guantanamo Bay, Cuba. In 2003, the President designated Hamdan for trial before a military commission for alleged war crimes.

Hamdan filed a petition for a writ of habeas corpus challenging the lawful authority of the military commissions established by Executive Order.

The Military Commission convened to try Hamdan lacks power to proceed because its structure and procedures violate both the Uniform Code of Military Justice (UCMJ) and the four Geneva Conventions signed in 1949. The judgment of the Court of Appeals is reversed.`,
  },
];
